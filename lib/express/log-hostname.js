'use strict';

const log = require('../utils/log');

module.exports = logHostname;

function logHostname(request, response, next) {
	if (!/^\/__/.test(request.url)) {
		let hostname = request.headers['x-original-host'] || 'unknown/direct';
		log.info(`BUILD-SERVICE-HOSTNAME: hostname=${hostname}`);
	}
	next();
}
