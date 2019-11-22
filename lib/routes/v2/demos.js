'use strict';

const outputDemo = require('../../middleware/outputDemo');
const cleanBrandParameter = require('../../middleware/cleanBrandParameter');
const defaultModuleVersions = require('../../middleware/defaultModuleVersions');

module.exports = app => {
	app.get('/v2/demos/:fullModuleName/:demoName',
		cleanBrandParameter(),
		defaultModuleVersions(),
		outputDemo(app));

	app.get('/v2/demos/:fullModuleName/:demoName/html',
		cleanBrandParameter(),
		defaultModuleVersions(),
		outputDemo(app, {
			outputMinimalHtml: true
		}));
};
