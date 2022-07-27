'use strict';

const outputDemo = require('../../middleware/v3/outputDemo').outputDemo;

module.exports = app => {
	app.get([
		'/__origami/service/build/v3/demo',
		'/__origami/service/build/v3/demo/html'
	 ], outputDemo);
};
