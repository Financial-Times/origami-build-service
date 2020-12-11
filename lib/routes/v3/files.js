'use strict';

const outputFile = require('../../middleware/v3/outputFile').outputFile;

module.exports = app => {
	app.get(
		'/v3/files',
		outputFile
	);
};
