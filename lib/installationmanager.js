'use strict';
const uuid = require('uuid');
const Q = require('./utils/q');
const pfs = require('q-io/fs');
const PromiseCache = require('./utils/promisecache');
const ModuleInstallation = require('./moduleinstallation');
const path = require('path');
const Registry = require('./registry');

const fiveMinutesMs = 5 * 60 * 1000;

function InstallationManager(options) {
	const opts = options || {};
	this.log = opts.log;
	this.metrics = opts.metrics;
	this._temporaryDirectory = opts.temporaryDirectory;

	this._directoryInitialised = pfs.makeTree(this._temporaryDirectory);
	this._installationCache = new PromiseCache({
		dispose: function(key, value) {
			if (value && value.result) {
				value.result.destroy();
			}
		},
		capacity: opts.capacity || 100
	});
	this._packageRegistry = new Registry();

}

InstallationManager.prototype = {
	/**
	 * Given a ModuleSet create an instance of its Installation returning a
	 * ModuleInstallation
	 */
	createInstallation: Q.async(function*(moduleSet, options) {
		const opts = options || {};
		const metrics = this.metrics;
		const modules = opts.versionLocks ? moduleSet.concatenate(opts.versionLocks) : moduleSet;

		yield this._directoryInitialised;
		const dir = this._newTempSubdir();

		const installation = new ModuleInstallation(modules, {
			log: this.log,
			dir: dir,
			sharedDir: this._temporaryDirectory,
			registry: this._packageRegistry
		});

		return this._installationCache
			.getMeta({
				id: modules.getIdentifier(),
				timeToLive: installation.getTTL(),
				newerThan: opts.newerThan,
				createCallback: Q.async(function*() {

					const installStartTime = Date.now();

					yield Q.captureErrors(moduleSet, function(){
						return Q.maxWait(fiveMinutesMs, installation.install(moduleSet), 'Bower install command');
					});
					const installEndTime = Date.now();
					metrics.count('modulesets.installTime', installEndTime - installStartTime);

					return {result: installation};

				}.bind(this))
			})
			.then(function(cacheMeta) {
				metrics.count('modulesets.'+((cacheMeta.hitCount) > 1 ? 'hits' : 'misses'), 1);
				return cacheMeta.result;
			})
		;
	}),

	_getTTL: function(moduleset) {

		// allow longer caching of bundles with precise version, because they won't be upgraded
		// (although not infinite cache here to prevent garbage from accumulating)
		const ttl = moduleset.hasExactVersionsOnly() ? this._installationTTLExact : this.installationTTL;
		const grace = Math.min(ttl/24, 2*3600*1000);

		// time is randomized to make expiry gradual
		return (ttl + (Math.random()-0.5)*grace);
	},

	/**
	 * Random subdirectory for a new Bower installation
	 *
	 * @return {string}
	 */
	_newTempSubdir: function() {
		return path.join(this._temporaryDirectory, uuid());
	},
};

module.exports = InstallationManager;
