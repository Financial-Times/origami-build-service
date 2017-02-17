'use strict';

const outputFile = require('../middleware/outputFile');

module.exports = function(app) {
	app.get(/^\/files\/[^\/]+\//, outputFile(app.origami.options));
};
