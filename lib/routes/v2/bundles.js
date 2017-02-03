'use strict';

const outputBundle = require('../../middleware/outputBundle');


module.exports = app => {

	const allowedBundleTypes = ['css', 'js'];

	app.param('type', validateBundleType);
	app.get('/v2/bundles/:type', outputBundle(app));


	function validateBundleType(req, res, next, type) {
		if (allowedBundleTypes.includes(type)) {
			next();
		} else {
			next('route');
		}
	}

};
