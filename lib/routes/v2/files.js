'use strict';

const outputFile = require('../../middleware/outputFile');

module.exports = app => {
	app.get(/^\/v2\/files\/[^\/]+\//, outputFile(app));
};
