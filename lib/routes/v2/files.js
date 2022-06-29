'use strict';

const outputFile = require('../../middleware/outputFile');
const getFromArchive = require('../../middleware/archive');

module.exports = app => {
	app.get([
		/^\/v2\/files\/[^/]+\//,
		/^\/__origami\/service\/build\/v2\/files\/[^/]+\//,
	],
	getFromArchive(app),
	outputFile(app));
};
