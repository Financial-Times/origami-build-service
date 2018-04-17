'use strict';

const outputDemo = require('../../middleware/outputDemo');

module.exports = app => {
	app.get('/v2/demos/:fullModuleName/:demoName', outputDemo(app));
	app.get('/v2/demos/:fullModuleName/:demoName/html', outputDemo(app, {
		outputMinimalHtml: true
	}));
};
