'use strict';

const outputBundle = require('../../middleware/outputBundle');
const requireModulesParameter = require('../../middleware/requireModulesParameter');
const cleanModulesParameter = require('../../middleware/cleanModulesParameter');

module.exports = app => {
	app.get(
		/^\/v2\/bundles\/(css|js)/,
		requireModulesParameter(),
		cleanModulesParameter(),
		outputBundle(app)
	);
};
