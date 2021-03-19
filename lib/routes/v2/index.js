'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const addNavigationToRequest = require('../../middleware/add-navigation-to-request');

module.exports = app => {
	// v2 home page
	app.get('/v2', cacheControl({ maxAge: '7d' }), addNavigationToRequest(), (request, response) => {
		response.header('Surrogate-Key', 'website');
		response.render('index', {
			title: 'Origami Build Service',
			layoutStyle: 'o-layout--landing',
			navigation: request.navigation
		});
	});
};
