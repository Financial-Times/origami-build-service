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
        response.render('url-updater', {
            title: 'Origami Build Service',
            layoutStyle: 'o-layout--landing',
            navigation: request.navigation
        });
    });

    app.post('/url-updater/', cacheControl({ maxAge: 0 }), addNavigationToRequest(), express.urlencoded({ extended: false }), express.text(), async (request, response) => {
        try {
            const url = parseBuildServiceUrl(request.body['build-service-url']);
            const brand = url.searchParams.get('brand');
            const modules = parseModulesParameter(url);
            const results = await evaluateModules(modules);
            const hasOutdatedComponents = results
                .some(component => !component.satisfies);
            const updatedBuildServiceUrl = decodeURIComponent(
                updateUrlForResults(url, results).toString()
            );
            response.render('url-updater', {
                title: 'Origami Build Service',
                layoutStyle: '',
                navigation: request.navigation,
                buildServiceUrl: url,
                updatedBuildServiceUrl,
                hasOutdatedComponents,
                brand,
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
