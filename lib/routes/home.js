'use strict';

module.exports = app => {
	// Service home page
	app.get([
		'/',
		'/__origami/service/build/',
		
		'/v1',
		'/__origami/service/build/v1',

		'/v2',
		'/__origami/service/build/v2',
	 ], (request, response) => {
		response.redirect(301, '/__origami/service/build/v3/');
	});
};
