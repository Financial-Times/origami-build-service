'use strict';

const outputBundle = require('../../middleware/outputBundle');

module.exports = app => {
	const outputDemo = outputBundle(app);
	app.get(/^\/v2\/demos\/[^\/]+\//, function (req, res, next) {
		req.params.type = 'demo';
		return outputDemo(req, res, next);
	});

};
