'use strict';

const express = require('express');
const Raven = require('raven');
const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const addNavigationToRequest = require('../middleware/add-navigation-to-request');
const parseModulesParameter = require('../url-updater/parse-modules-parameter');
const evaluateModules = require('../url-updater/evaluate-modules');
const parseBuildServiceUrl = require('../url-updater/parse-build-service-url');
const updateUrlForResults = require('../url-updater/update-url-for-results');
const UserError = require('../utils/usererror');

module.exports = app => {
	app.get('/url-updater/', cacheControl({ maxAge: '7d' }), addNavigationToRequest(), (request, response) => {
		response.header('Surrogate-Key', 'website');
		response.render('url-updater', {
			title: 'Origami Build Service',
			navigation: request.navigation
		});
	});

	app.post('/url-updater/', cacheControl({ maxAge: 0 }), addNavigationToRequest(), express.urlencoded({ extended: false }), express.text(), async (request, response) => {
		try {
			const url = parseBuildServiceUrl(request.body['build-service-url']);
			const brand = url.searchParams.get('brand');
			const systemCode = url.searchParams.get('system_code');
			const modules = parseModulesParameter(url);
			const results = await evaluateModules(modules);
			const hasOutdatedComponents = results
				.some(component => !component.satisfies);
			const hasComponentsBehindTheLatestBowerMajor = results
				.some(component => component.belowLatestBowerRelease);
			const hasComponentsBehindTheLatestMajor = results
				.some(component => component.belowLatestMajorRelease);
			const npmUpgrades = results
				.some(component => component.requestedLastBowerMajor);
			const hasFurtherNpmOnlyMajorReleases = results
				.some(component => component.hasFurtherNpmOnlyMajorReleases);

			const updatedBuildServiceUrl = decodeURIComponent(await updateUrlForResults(url, results));

			const missingParamWarnings = [];
			if (!brand && updatedBuildServiceUrl.includes('bundles/css')) {
				missingParamWarnings.push('brand');
			}
			if (!systemCode) {
				missingParamWarnings.push('system_code');
			}
			response.render('url-updater', {
				title: 'Origami Build Service',
				layoutStyle: '',
				navigation: request.navigation,
				buildServiceUrl: url,
				updatedBuildServiceUrl,
				hasOutdatedComponents,
				brand,
				missingParamWarnings,
				hasComponentsBehindTheLatestBowerMajor,
				npmUpgrades,
				hasFurtherNpmOnlyMajorReleases,
				hasComponentsBehindTheLatestMajor,
				results,
			});
		} catch (error) {
			let errorMessage = error.message;
			if (!(error instanceof UserError)) {
				Raven.captureException(error);
				console.error(error, JSON.stringify(error));
				errorMessage = 'Sorry something went wrong whilst evaluating '
                    + 'your Build Service URL against the latest component '
                    + 'releases.';
			}
			return response.status(400).render('url-updater', {
				title: 'Origami Build Service',
				layoutStyle: '',
				navigation: request.navigation,
				error: errorMessage
			});
		}
	});
};
