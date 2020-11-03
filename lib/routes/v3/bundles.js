'use strict';

const {createJavaScriptBundle} = require('../../middleware/v3/createJavaScriptBundle');
module.exports = app => {
	app.get(
		'/v3/bundles/js/',
		createJavaScriptBundle
	);
};
