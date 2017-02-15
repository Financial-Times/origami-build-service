'use strict';

module.exports = app => {

	// v1 endpoint redirect
	app.get('/v1', (request, response) => {
		response.redirect(301, `${request.basePath}v2/`);
	});

};
