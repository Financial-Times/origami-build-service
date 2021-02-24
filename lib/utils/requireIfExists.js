'use strict';

const { readIfExists } = require('./readIfExists');

async function requireIfExists(filePath) {
	return readIfExists(filePath).then(file => {
		return file ? JSON.parse(file) : undefined;
	});
}

module.exports = {
    requireIfExists
};
