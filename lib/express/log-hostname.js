'use strict';

const log = require('../utils/log');
const url = require('url');

module.exports = logHostname;

function logHostname(request, response, next) {
	if (!/^\/__/.test(request.url)) {
		const originalUrl = request.headers['ft-original-url'];
		let hostname;
		if (originalUrl) {
			hostname = url.parse(originalUrl).hostname;
		} else {
			hostname = 'unknown/direct';
		}
		log.info(`BUILD-SERVICE-HOSTNAME: hostname=${hostname}`);
	}
	next();
}
