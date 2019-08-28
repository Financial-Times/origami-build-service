'use strict';

const Output = require('./output');
const JsBundler = require('./jsbundler');
const CssBundler = require('./cssbundler');
const DemoCompiler = require('./democompiler');
const streamCat = require('streamcat');
const Q = require('./utils/q');
const PromiseCache = require('./utils/promisecache');
const {getCacheKeyForParameters} = require('./utils/cacheKey');

function Bundler(options) {
	this.options = options || {};
	this.log = this.options.log;
	this.metrics = this.options.metrics;
	this._bundleCache = new PromiseCache();
}

Bundler.prototype = {
	/** Given a requested ModuleSet, and its installation return an Output
	 */
	getBundle: Q.async(function* (type, installationPromise, moduleSet, options) {
		const opts = options || {};
		const log = this.log;
		const metrics = this.metrics;

		const installation = yield installationPromise;
		const modules = opts.versionLocks ? moduleSet.concatenate(opts.versionLocks) : moduleSet;

		const uniqueIdentifier =
			modules.getIdentifier() +
			(type === 'css' && options.brand ? options.brand + '.' : '') + // Only CSS changes according to the brand.
			(type === 'css' && options.source ? options.source + '.' : '') + // Only CSS changes according to the source.
			moduleSet.getMainPathOverridesIdentifier() + '.' +
			(opts.demoName ? opts.demoName + '.' : '') +
			type + '.' +
			'v2.' +
			'min:' + opts.minify + '.' +
			'polyfills:' + opts.babelRuntime + '.' +
			getCacheKeyForParameters(opts)
		;

		metrics.count('bundles.bytype.'+type, 1);

		return this._bundleCache
			.getMeta({
				id: uniqueIdentifier,
				timeToLive: installation.getTTL() - 500,
				newerThan: options.newerThan,
				createCallback: Q.async(function*(){
					const contentStream = this._createContentStream(type, installationPromise, moduleSet, options);
					log.info({id: uniqueIdentifier}, 'Creating new bundle');
					return {
						result: new Output(this._getMimeType(type), yield Q.streamIntoBuffer(contentStream), installation.getTTL())
					};
				}.bind(this))
			})
			.then(function(cacheMeta) {
				metrics.count('bundles.'+((cacheMeta.hitCount) > 1 ? 'hits' : 'misses'), 1);
				return cacheMeta.result;
			})
		;
	}),

	_createContentStream: function (type, installationPromise, moduleSet, options) {
		const metrics = this.metrics;
		let bundler;

		if (type === 'js') {
			bundler = new JsBundler(this.options);
		} else if (type === 'css') {
			bundler = new CssBundler(this.options);
		} else if (type === 'demo') {
			bundler = new DemoCompiler(this.options);
		} else {
			throw new Error('Invalid type, should be \'js\' or \'css\'');
		}

		const bundleStreamPromise = installationPromise.then(function(installation) {
			const buildStartTime = Date.now();
			return bundler
				.getContent(installation, moduleSet, options)
				.then(function(bundle) {
					const buildEndTime = Date.now();
					metrics.count('bundles.buildTime', buildEndTime - buildStartTime);
					return bundle;
				})
			;
		});

		// streamCat can handle the conversion of a Promise<Stream> to a Stream
		return streamCat([bundleStreamPromise], {
			errorMapper: function(error) {
				return error;
			}
		});
	},

	_getMimeType: function(type) {
		if (type === 'js') {
			return 'application/javascript;charset=UTF-8';
		} else if (type === 'css') {
			return 'text/css;charset=UTF-8';
		} else if (type === 'demo') {
			return 'text/html;charset=UTF-8';
		}

		throw new Error('Invalid type, should be \'js\' or \'css\'');
	},

};

module.exports = Bundler;
