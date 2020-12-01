'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;

module.exports = app => {

	// v2 home page
	app.get('/v3', cacheControl({maxAge: '7d'}), (request, response) => {
		response.render('index', {
			title: 'Origami Build Service',
			pageLayout: 'docs',
			showNav: true,
		});
	});

};
