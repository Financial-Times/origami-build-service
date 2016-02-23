'use strict';
const Q = require('./q');
const LRUMap = require('lru-cache');

/**
 * Stores objects with limited lifetime and allows cached objects to be refreshed in the background.
 */
function PromiseCache(options) {
	const opts = options || {};
	const cacheCapacity = opts.capacity || 100;

	this.cache = new LRUMap({
		dispose: opts.dispose || function() {},
		max: cacheCapacity
	});

	this.stats = {
		hits: 0,
		misses: 0,
		errors: 0,
	};
}

PromiseCache.prototype = {
	/**
	 * Get *Promise* for the cached object. Promise is fullfilled with actual value.
	 *
	 * Options are:
	 *  - id — Required. key that identifies object to retreive
	 *  - createCallback — Required. Function that should return promise for {result:objectToCache} (it's called when there is no cached object or cached object has expired)
	 *  - timeToLive — number of milliseconds to cache object for
	 *  - newerThan — allow returning of a stale object as long as it's newer than given time in milliseconds (Date.now() gets new, uncached object)
	 *
	 * @param  {object} options
	 * @return {Promise}
	 */
	get: function(options) {
		return this.getMeta(options).then(function(meta) {
			return meta.result;
		});
	},

	/**
	 * Returns promise of metadata of cached object (expiry time, etc.)
	 *
	 * metadata contains:
	 *  - createdTime — timestamp in milliseconds when object has been generated (started to be generated to be precise)
	 *  - expiryTime — when object will become stale
	 *  - result — actual cached object (same as get())
	 *
	 * Please don't rely on other metadata returned by this method.
	 *
	 * @param  {object} options @see get()
	 * @return {Promise}
	 */
	getMeta: function(options) {
		if (!options.timeToLive) {
			throw new Error('missing timeToLive option');
		}

		const startTime = this.now();
		const newerThan = Math.min(startTime, options.newerThan || 0); // Don't allow future newerThan to prevent rebuild loop
		const id = options.id;
		let cached = this.cache.get(id);
		if (cached) {

			// Use cached value if it's fresh, or use stale one if the next value is already being built
			// newerThan is always respected (it's equivalent of HTTP's max-stale)
			if ((startTime < cached.expiryTime || cached._next) && cached.createdTime >= newerThan) {

				// Promise can be used before it's been resolved,
				// this gives nice thundering herd protection for free.
				this.stats.hits++;
				cached.hitCount++;
				return cached._promise;
			}

			// Wait for the new value to finish and re-evaluate conditions then
			if (cached._next) {
				this.stats.misses++;
				return cached._next._promise.then(this.getMeta.bind(this, options));
			}
		}

		const next = {
			createdTime: startTime,
			expiryTime: startTime + options.timeToLive,	// time is randomized to make expiry nicer (gradual)
			hitCount: 1,
			result: undefined, // stores actual generated value (not promise)
			_promise: Q.fcall(options.createCallback).then(function(created){
				if ('undefined' === typeof created.result) {
					throw new Error('Create callback failed to return result obj; id=' + id);
				}
				if (created.timeToLive) {
					next.expiryTime = Math.min(next.expiryTime, this.now() + created.timeToLive);
				}
				next.result = created.result;
				return next;
			}.bind(this), function(err){
				if (!err) err = new Error('Generation of ' + id + ' failed for unknown reason');

				this.stats.errors++;
				const now = this.now();

				// Errors shouldn't be cached as long as successfully generated values
				next.expiryTime = now + (options.errorTimeToLive || 10000);
				err.occurrenceTime = now;
				throw err;
			}.bind(this)),
			_next: undefined,
		};

		if (cached) {
			cached._next = next;

			// Replace old value with the new one - always (otherwise old errors never get replaced,
			// or last successful value remains cached forever while rebuilds fail.)
			// Replaces next._promise to guarantee any read retries are run after the cache.set()
			next._promise = next._promise.finally(function() {
				cached._next = undefined;
				this.cache.set(id, next);
			}.bind(this));

			// if stale response is OK then return it now
			if (cached._promise.isFulfilled() && cached.createdTime >= newerThan) {
				this.stats.hits++;
				return cached._promise;
			}
		} else {
			this.cache.set(id, next);
		}

		this.stats.misses++;
		return next._promise;
	},

	/**
	 * Number of cached entries
	 *
	 * @return {Number}
	 */
	getStats: function() {
		this.stats.cached = this.cache.size;
		return this.stats;
	},

	// for testing
	now: Date.now.bind(Date),
};

module.exports = PromiseCache;
