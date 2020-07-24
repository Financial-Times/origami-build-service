'use strict';

const fs = require('fs');
const path = require('path');

function requireIfExists(filePath) {
	if (fs.existsSync(filePath)) {
		return require(filePath);
	} else {
		return undefined;
	}
}

function getModuleName(cwd) {
	if (!cwd) {
		throw new Error('Could not get component name. No directory for the component was given.');
	}
	const bowerPath = path.join(cwd, '/bower.json');
	const bowerJson = requireIfExists(bowerPath);
	if (bowerJson) {
		return bowerJson.name;
	}
	return '';
}

// List mustache files in a directory, recursing over subdirectories
function getMustacheFilesList(basePath) {
	let mustacheFiles = [];

	fs.readdirSync(basePath, {encoding: 'utf8'}).forEach(filePath => {
		filePath = path.join(basePath, filePath);
		const stat = fs.statSync(filePath);

		// If the current path points to a directory, recurse
		// over it
		if (stat.isDirectory()) {
			mustacheFiles = mustacheFiles.concat(getMustacheFilesList(filePath));

		// If the current path points to a mustache file, add
		// it to the output list
		} else if (path.extname(filePath) === '.mustache') {
			mustacheFiles.push(filePath);
		}
	});

	return mustacheFiles.sort();
}

exports.getModuleName = getModuleName;
exports.getMustacheFilesList = getMustacheFilesList;
