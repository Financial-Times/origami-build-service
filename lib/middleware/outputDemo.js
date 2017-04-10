'use strict';

const querystring = require('querystring');
const ModuleSet = require('../moduleset');
const cacheControlHeaderFromExpiry = require('../utils/cacheControlHeaderFromExpiry');
const CompileError = require('../utils/compileerror');
const path = require('path');
const InstallationManager = require('../installationmanager');
const Bundler = require('../bundler');

module.exports = app => {
	const timeoutDurationMSec = 20000;
	const maxBuildTimeMSec = 60000;
	const {metrics, options} = app.origami;

	const bundler = new Bundler(Object.assign({}, options, {metrics}));
	const installationManager = new InstallationManager({
		log: options.log,
		metrics: metrics,
		temporaryDirectory: options.tempdir
	});

	function promiseTimeout(duration) {
		return new Promise(function (resolve, reject) {
			setTimeout(reject, duration, 'timeout');
		});
	}

	return function outputDemo(req, res, next) {
		const fullModuleName = req.params.fullModuleName;
		const demoName = req.params.demoName;

		const bundleDetails = {
			demoName: demoName,
			reqUrl: req.url
		};

		const moduleset = new ModuleSet([fullModuleName]);

		const moduleInstallationPromise = installationManager.createInstallation(moduleset, {});

		// If bundle takes a long time to generate, issue a redirect response to reconnect -
		// this avoids short request timeouts in Heroku and other possible intermediary nodes.
		// Also when running multiple build service nodes, this provides an opportunity to
		// connect to a different backend that may already have the bundle in cache
		return Promise.race([
			bundler.getBundle('demo', moduleInstallationPromise, moduleset, bundleDetails),
			promiseTimeout(timeoutDurationMSec)
		]).then(function (bundle) {

			// If request went via any redirects, redirect one final time to the canonical URL to enable response to be cached efficiently and avoid caching URLs containing `redirects` args
			if (req.query.redirects) {
				delete req.query.redirects;
				metrics.count('routes.bundle.redirect', 1);
				res.redirect(307, selfURL(req));
			} else {
				console.log(bundle.createdTime, new Date(bundle.createdTime).toUTCString);
				res.set({
					'Content-Type': bundle.mimeType,
					'Last-Modified': new Date(bundle.createdTime).toUTCString(),
					'Cache-Control': cacheControlHeaderFromExpiry(bundle.expiryTime)
				});

				if (req.query.shrinkwrap) {
					metrics.count('routes.bundle.serveShrinkWrapped', 1);
				}
				metrics.count('routes.bundle.serve', 1);
				bundle.pipe(res).end();
			}
		}).catch(function (error) {
			if (error === 'timeout') {
				req.query.redirects = parseInt(req.query.redirects || 0, 10) + 1;
				if ((req.query.redirects * timeoutDurationMSec) > maxBuildTimeMSec) {
					metrics.count('routes.bundle.timeout', 1);
					next(new CompileError('Maximum allowable build time exceeded'));
				} else {
					res.redirect(307, selfURL(req));
				}
			} else {
				// Pass on any real errors so Express can convert them into an appropriate HTTP response
				metrics.count('routes.bundle.error', 1);
				next(error);
			}
		});
	};

	function selfURL(req) {
		const qs = querystring.stringify(req.query);
		return path.join(req.basePath, req.path) + (qs ? '?' + qs : '');
	}
};
