'use strict';

const outputDemo = require('../../middleware/v3/outputDemo').outputDemo;

module.exports = app => {
	app.get('/v3/demo', outputDemo);

	app.get('/v3/demo/html', outputDemo);
};
