'use strict';

const outputDemo = require('../../middleware/v3/outputDemo').outputDemo;

module.exports = app => {
	app.get([
		'/v3/demo',
		'/__origami/service/build/v3/demo',
	 ], outputDemo);

	app.get([
		'/v3/demo/html',
		'/__origami/service/build/v3/demo/html',
	 ], outputDemo);
};
