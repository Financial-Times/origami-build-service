'use strict';

module.exports = app => {

	// Service home page
	app.get([
		'/__origami/service/build/',
	 ], (request, response) => {
		response.redirect(301, '/__origami/service/build/v3/');
	});

};
