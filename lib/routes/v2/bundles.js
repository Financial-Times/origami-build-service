'use strict';

const outputBundle = require('../../middleware/outputBundle');
const requireModulesParameter = require('../../middleware/requireModulesParameter');
const cleanModulesParameter = require('../../middleware/cleanModulesParameter');
const defaultModuleVersions = require('../../middleware/defaultModuleVersions');
const reportDisallowedModules = require('../../middleware/reportDisallowedModules');
const cleanBrandParameter = require('../../middleware/cleanBrandParameter');
const cleanSourceParameter = require('../../middleware/cleanSourceParameter');
const cleanExportsParameter = require('../../middleware/cleanExportsParameter');

module.exports = app => {
	app.get(
		/^\/v2\/bundles\/(css|js)/,
		requireModulesParameter(),
		cleanModulesParameter(),
		defaultModuleVersions(),
		reportDisallowedModules(),
		cleanSourceParameter(),
		cleanBrandParameter(),
		cleanExportsParameter(),
		outputBundle(app)
	);
};
