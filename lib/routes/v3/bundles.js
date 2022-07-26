'use strict';

const {createJavaScriptBundle} = require('../../middleware/v3/createJavaScriptBundle');
const {createCssBundle} = require('../../middleware/v3/createCssBundle');
module.exports = app => {
	app.get([
		'/__origami/service/build/v3/bundles/js/',
	],
	createJavaScriptBundle
	);
	app.get([
		'/__origami/service/build/v3/bundles/css/',
	],
	createCssBundle
	);
};
