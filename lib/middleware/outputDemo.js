'use strict';

const querystring = require('querystring');
const ModuleSet = require('../moduleset');
const cacheControlHeaderFromExpiry = require('../utils/cacheControlHeaderFromExpiry');
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

	const registry = new Registry();

	function promiseTimeout(duration) {
		return new Promise(function (resolve, reject) {
			setTimeout(reject, duration, 'timeout');
		});
	}

	return function outputDemo(req, res, next) {
		const fullModuleName = req.params.fullModuleName;
		const demoName = req.params.demoName;
		const brand = req.query['brand'] || process.env.DEFAULT_BRAND;

		const bundleDetails = {
			demoName: demoName,
			reqUrl: req.url
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
						brand,
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
                    console.log(bundle.createdTime, new Date(bundle.createdTime).toUTCString);
                    res.set({
                        'Content-Type': bundle.mimeType,
                        'Last-Modified': new Date(
                            bundle.createdTime
                        ).toUTCString(),
                        'Cache-Control': cacheControlHeaderFromExpiry(
                            bundle.expiryTime
                        ),
                    });

                    if (req.query.shrinkwrap) {
                        metrics.count('routes.demo.serveShrinkWrapped', 1);
                    }
                    metrics.count('routes.demo.serve', 1);
                    bundle.pipe(res).end();
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
