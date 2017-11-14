'use strict';

const ONE_YEAR_SECONDS = 31536000;

module.exports = app => {

	// v1 endpoint redirect
	app.get('/v1', (request, response) => {
		response.header('Surrogate-Control', `public, max-age=${ONE_YEAR_SECONDS}, stale-while-revalidate=${ONE_YEAR_SECONDS}, stale-if-error=${ONE_YEAR_SECONDS}`);
		response.redirect(301, `${request.basePath}v2/`);
	});

};
