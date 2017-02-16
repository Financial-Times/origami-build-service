'use strict';

const outputFile = require('../../middleware/outputFile');

module.exports = function(app) {

	app.get(/^\/v1\/files\/[^\/]+\//, outputFile(app.origami.options));

};
