'use strict';

const fs = require('fs').promises;
const fileExists = require('fs').existsSync;

async function readIfExists(filePath) {
	const exists = fileExists(filePath);
	if (exists) {
		return fs.readFile(filePath, 'utf-8');
	} else {
		return undefined;
	}
}

module.exports = {
    readIfExists
};
