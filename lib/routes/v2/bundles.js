'use strict';

module.exports = app => {
	const buildSystem = app.origami.options.buildSystem;
	const allowedBundleTypes = ['css', 'js'];

	app.param('type', validateBundleType);
	app.get('/v2/bundles/:type', createBundle);

	function createBundle(req, res, next) {
		buildSystem.outputBundle(req.params.type, req, res, next);
	}

	function validateBundleType(req, res, next, type) {
		if (allowedBundleTypes.includes(type)) {
			next();
		} else {
			next('route');
		}
	}
};
