'use strict';

const express = require('express');
const Raven = require('raven');
const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const navigation = require('../../data/navigation.json');
const parseModulesParameter = require('../url-builder/parse-modules-parameter');
const evaluateModules = require('../url-builder/evaluate-modules');
const parseBuildServiceUrl = require('../url-builder/parse-build-service-url');
const updateUrlForResults = require('../url-builder/update-url-for-results');
const UserError = require('../utils/usererror');

function addNavigationToRequest() {
    return (request, response, next) => {
        const path = request.path.split('?')[0];
        navigation.items.map(item => item.current = false);
        const item = navigation.items.find(item => {
            return path === '/' + item.href;
        });
        if (item) {
            item.current = true;
        }
        request.navigation = navigation;
        next();
    };
}

module.exports = app => {
    app.get('/url-builder/', cacheControl({ maxAge: '7d' }), addNavigationToRequest(), (request, response) => {
        response.render('url-builder', {
            title: 'Origami Build Service',
            layoutStyle: 'o-layout--landing',
            navigation: request.navigation
        });
    });

    app.post('/url-builder/', cacheControl({ maxAge: '5m' }), addNavigationToRequest(), express.urlencoded({ extended: false }), express.text(), async (request, response) => {
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
            response.render('url-builder', {
                title: 'Origami Build Service',
                layoutStyle: '',
                navigation,
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
            return response.status(400).render('url-builder', {
                title: 'Origami Build Service',
                layoutStyle: '',
                navigation: request.navigation,
                error: errorMessage
            });
        }
    });
};
