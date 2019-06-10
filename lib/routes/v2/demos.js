'use strict';

const outputDemo = require('../../middleware/outputDemo');
const cleanBrandParameter = require('../../middleware/cleanBrandParameter');

module.exports = app => {
	app.get('/v2/demos/:fullModuleName/:demoName',
		cleanBrandParameter(),
		outputDemo(app));

	app.get('/v2/demos/:fullModuleName/:demoName/html',
		cleanBrandParameter(),
		outputDemo(app, {
		outputMinimalHtml: true
	}));
};
