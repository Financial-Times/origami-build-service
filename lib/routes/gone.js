'use strict';

module.exports = function(app) {
	app.get([
		/^\/__origami\/service\/build\/files\/[^/]+\//,
		/^\/__origami\/service\/build\/v1\/files\/[^/]+\//,

		/^\/__origami\/service\/build\/bundles\/(css|js)/,
		/^\/__origami\/service\/build\/v1\/bundles\/(css|js)/,

		'/__origami/service/build/modules/:module',
		'/__origami/service/build/v1/modules/:module',

		'/__origami/service/build/v2/modules/:module',

		'/__origami/service/build/url-updater/',

	], (req, res, next) => {
		const gone = new Error('This endpoint no longer exists, and there is no direct alternative. For support please speak to the Origami team.');
		gone.status = 410;
		next(gone);
	});
};
