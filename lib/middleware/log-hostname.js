'use strict';

module.exports = logHostname;

function logHostname(log) {
	return (request, response, next) => {
		if (!/^\/__/.test(request.url)) {
			const hostname = request.headers['x-original-host'] || 'unknown/direct';
			const referer = request.headers['referer'] || null;
			log.info(`BUILD-SERVICE-HOSTNAME: hostname=${hostname} path=${request.url} referer=${referer}`);
		}
		next();
	};
}
