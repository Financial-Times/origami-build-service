'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const addNavigationToRequest = require('../../../middleware/add-navigation-to-request');

module.exports = app => {
	app.get([
		'/__origami/service/build/v3/docs/api',
	 ], cacheControl({ maxAge: '7d' }), addNavigationToRequest(), (request, response) => {
		response.header('Surrogate-Key', 'origami-build-service-website');
		response.render('apiv3', {
			title: 'API Reference - Origami Build Service',
			layoutStyle: 'o-layout--docs',
			navigation: request.navigation
		});
	});

};
