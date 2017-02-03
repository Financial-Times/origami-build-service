'use strict';

const ftwebservice = require('express-ftwebservice');
const path = require('path');
const healthChecks = require('../health-checks');

module.exports = function(app) {
	const healthMonitor = healthChecks(app.origami.options);
	const info = {
		manifestPath: path.join(__dirname, '../../package.json'),
		about: require(path.join(__dirname, '../../about.json'))
	};

	info.goodToGo = function() {
		const checks = healthMonitor.getCheckResults();
		return !checks.every(function(check) {
			// Only severity 1 and 2 checks count towards GTG:
			// Return true for all checks with severity greater than two, else,
			// return the result of the check.
			return check.severity > 2 || check.ok;
		});
	};

	info.healthCheck = function() {
		return new Promise(function(resolve) {
			resolve(healthMonitor.getCheckResults());
		});
	};

	ftwebservice(app, info);
};
