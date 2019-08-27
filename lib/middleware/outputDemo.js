'use strict';

const querystring = require('querystring');
const ModuleSet = require('../moduleset');
const cacheControlHeaderFromExpiry = require('../utils/cacheControlHeaderFromExpiry');
const cheerio = require('cheerio');
const CompileError = require('../utils/compileerror');
const path = require('path');
const InstallationManager = require('../installationmanager');
const Registry = require('../registry');
const Bundler = require('../bundler');
const HttpError = require('../express/httperror');

const validateOnlyFtModules = (registry, moduleSet) => {
	const resolvedModules = moduleSet.getResolvedModules();

	return registry.getPackageList().then((ftRegistryModules) => {
		const ftRegistryModuleNames = ftRegistryModules.map(({ name }) => name);
		const nonFtModules = resolvedModules
			.filter(({moduleName}) =>
				!ftRegistryModuleNames
					.includes(moduleName)
			);

		if (nonFtModules.length > 0) {
			const invalidNonFtModulesString = nonFtModules
				.reduce((result, {moduleName: name}) =>
					`${result}\n\t- ${name}`
				, '');

			throw new HttpError(
				400,
				`The modules parameter contains module names which are not on the FT bower registry: ${invalidNonFtModulesString}`
			);
		}
	});
};

const validateOnlyOrigamiModules = (installation) => {
	return installation.listDirectNoneOrigamiComponents()
		.then(Object.keys)
		.then((nonOrigamiComponents) => {
			if (nonOrigamiComponents.length > 0) {
				const invalidNonOrigamiModulesString = nonOrigamiComponents
					.reduce((result, moduleName) =>
						`${result}\n\t- ${moduleName}`
					, '');

				throw new HttpError(
					400,
					`The modules parameter contains module names which are not origami modules: ${invalidNonOrigamiModulesString}`
				);
			}
		});
};

const extractMinimalHtml = (fullHtml) => {
	const $ = cheerio.load(fullHtml);
	const body = $('body');

	// Find all top-level non-template script and link elements
	const elements = body.find('> script:not([type="text/template"]), > link');

	// Strip script and link elements that reference Origami URLs
	for (const el of elements.toArray()) {
		const element = $(el);
		const url = element.attr('src') || element.attr('href');
		if (url && /^(https?\:)?\/\/(www\.|([a-z0-9]+\.)?origami(\-[\-a-z0-9]+)?\.)?ft\.com\/?/i.test(url)) {
			element.remove();
		}
	}

	// Return the body inner HTML
	return body.html().trim();
};

module.exports = (app, middlewareOptions = {}) => {
	const timeoutDurationMSec = 20000;
	const maxBuildTimeMSec = 60000;
	const {metrics, options} = app.ft;

	const bundler = new Bundler(Object.assign({}, options, {metrics}));
	const installationManager = new InstallationManager({
		log: options.log,
		metrics: metrics,
		temporaryDirectory: options.tempdir
	});

	const registry = new Registry();

	function promiseTimeout(duration) {
		return new Promise(function (resolve, reject) {
			setTimeout(reject, duration, 'timeout');
		});
	}

	return function outputDemo(req, res, next) {
		const fullModuleName = req.params.fullModuleName;
		const demoName = req.params.demoName;

		const source = req.query['source'];
		const brand = req.query['brand'];

		const bundleDetails = {
			demoName: demoName,
			reqUrl: req.url,
			source,
			brand
		};

		const moduleSet = new ModuleSet([fullModuleName]);

		let moduleInstallationPromise;

		return validateOnlyFtModules(registry, moduleSet)
			.then(() => {
				moduleInstallationPromise = installationManager.createInstallation(moduleSet, {});

				return moduleInstallationPromise;
			})
			.then(installation => validateOnlyOrigamiModules(installation))
			.then(() => {
				// If bundle takes a long time to generate, issue a redirect response to reconnect -
				// this avoids short request timeouts in Heroku and other possible intermediary nodes.
				// Also when running multiple build service nodes, this provides an opportunity to
				// connect to a different backend that may already have the bundle in cache
				return Promise.race([
					bundler.getBundle(
						'demo',
						moduleInstallationPromise,
						moduleSet,
						bundleDetails
					),
					promiseTimeout(timeoutDurationMSec),
				]);
			})
			.then(function(bundle) {
				// If request went via any redirects, redirect one final time to the canonical URL to enable response to be cached efficiently and avoid caching URLs containing `redirects` args
				if (req.query.redirects) {
					delete req.query.redirects;
					metrics.count('routes.demo.redirect', 1);
					res.redirect(307, selfURL(req));
				} else {
					res.set({
						'Last-Modified': new Date(
							bundle.createdTime
						).toUTCString(),
						'Cache-Control': cacheControlHeaderFromExpiry(
							bundle.expiryTime
						)
					});

					if (req.query.shrinkwrap) {
						metrics.count('routes.demo.serveShrinkWrapped', 1);
					}
					if (middlewareOptions.outputMinimalHtml) {
						const minimalHtml = extractMinimalHtml(bundle.toString());
						res.set({
							'Content-Type': 'text/plain'
						});
						res.send(minimalHtml);
					} else {
						res.set({
							'Content-Type': bundle.mimeType
						});
						bundle.pipe(res).end();
					}
					metrics.count('routes.demo.serve', 1);
				}
			})
			.catch(function(error) {
				if (error === 'timeout') {
					req.query.redirects = parseInt(req.query.redirects || 0, 10) + 1;
					if (req.query.redirects * timeoutDurationMSec > maxBuildTimeMSec) {
						metrics.count('routes.demo.timeout', 1);
						next(new CompileError('Maximum allowable build time exceeded'));
					} else {
						res.redirect(307, selfURL(req));
					}
				} else {
					// Pass on any real errors so Express can convert them into an appropriate HTTP response
					metrics.count('routes.demo.error', 1);
					next(error);
				}
			});
	};

	function selfURL(req) {
		const qs = querystring.stringify(req.query);
		return path.join(req.basePath, req.path) + (qs ? '?' + qs : '');
	}
};
