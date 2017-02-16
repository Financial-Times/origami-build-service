'use strict';

const log = require('../utils/log');

module.exports = logHostname;

function logHostname(request, response, next) {
	if (!/^\/__/.test(request.url)) {
		const hostname = request.headers['x-original-host'] || 'unknown/direct';
		const referer = request.headers['referer'] || null;
		log.info(`BUILD-SERVICE-HOSTNAME: hostname=${hostname} path=${request.url} referer=${referer}`);
	}
	next();
}
