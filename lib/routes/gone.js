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

	], (req, res, next) => {
		const gone = new Error('The modules endpoint no longer exists. There is no direct alternative. For support speak to the Origami team.');
		gone.status = 410;
		next(gone);
	});
};
