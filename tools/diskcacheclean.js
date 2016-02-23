'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

module.exports = function cleanDiskCache() {
	const currentPid = process.pid;

	fs.readdir('/tmp', function(err, files) {
		files.forEach(function(file) {
			const matches = file.match(/^buildservice\-([0-9]+)$/);
			if (matches && matches[1] && Number(matches[1]) !== currentPid) {
				rimraf(path.join('/tmp', file), function() {});
			}
		});
	});
};
