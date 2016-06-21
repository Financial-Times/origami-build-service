'use strict';

const Output = require('./output');
const JsBundler = require('./jsbundler');
const CssBundler = require('./cssbundler');
const DemoCompiler = require('./democompiler');
const streamCat = require('streamcat');
const Q = require('./utils/q');
const PromiseCache = require('./utils/promisecache');
const uniqueid = require('./utils/uniqueid');
const log = require('./utils/log');
const metrics = require('./monitoring/metrics');

function Bundler() {
	this._bundleCache = new PromiseCache();
}

Bundler.prototype = {
	/** Given a requested ModuleSet, and its installation return an Output
	 */
	getBundle: Q.async(function*(type, installationPromise, moduleSet, options) {
		const opts = options || {};

		const installation = yield installationPromise;
		const modules = opts.versionLocks ? moduleSet.concatenate(opts.versionLocks) : moduleSet;

		const uniqueIdentifier =
			modules.getIdentifier() +
			moduleSet.getMainPathOverridesIdentifier() + '.' +
			(opts.demoName ? opts.demoName + '.' : '') +
			type + '.' +
			'v2.' +
			'min:' + opts.minify + '.' +
			'polyfills:' + opts.babelRuntime + '.' +
			((typeof options.exportName === 'string' )? uniqueid(options.exportName, 64) : 'noexportname')
		;

		metrics.counter('bundles.bytype.'+type).inc();

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
				metrics.counter('bundles.'+((cacheMeta.hitCount) > 1 ? 'hits' : 'misses')).inc();
				return cacheMeta.result;
			})
		;
	}),

	_createContentStream: function(type, installationPromise, moduleSet, options) {
		let bundler;

		if (type === 'js') {
			bundler = new JsBundler();
		} else if (type === 'css') {
			bundler = new CssBundler();
		} else if (type === 'demo') {
			bundler = new DemoCompiler();
		} else {
			throw new Error('Invalid type, should be \'js\' or \'css\'');
		}

		const bundleStreamPromise = installationPromise.then(function(installation) {
			const buildTimer = metrics.timer('bundles.buildTime').start();
			return bundler
				.getContent(installation, moduleSet, options)
				.then(function(bundle) {
					buildTimer.end();
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
