'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const addNavigationToRequest = require('../../../middleware/add-navigation-to-request');

module.exports = app => {
	app.get([
		'/v2/docs/migration',
		'/__origami/service/build/v2/docs/migration',
	 ], cacheControl({ maxAge: '7d' }), addNavigationToRequest(), (request, response) => {
		response.header('Surrogate-Key', 'origami-build-service-website');
		response.render('migration', {
			title: 'Migration Guide - Origami Build Service',
			layoutStyle: 'o-layout--docs',
			navigation: request.navigation
		});
	});
};
