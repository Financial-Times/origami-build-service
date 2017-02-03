'use strict';

module.exports = app => {

	// v1 endpoint redirect
	app.get('/v1', (request, response) => {
		const url = `${request.basePath}v2${request.url}`;
		response.redirect(301, url);
	});

};
