'use strict';

const path = require('path');
const raven = require('raven');
const bunyan = require('bunyan');
const appVersion = require(path.join(__dirname,'../../package.json')).version;

// Raven provides an automatic no-op client if a DSN is not set
const ravenClient = new raven.Client(process.env.SENTRY_DSN, {
	release: appVersion
});

let logger;

if (process.env.NODE_ENV === 'production') {
	logger = bunyan.createLogger({
		name: 'buildservice',
		streams: [
			{
				level: process.env.LOG_LEVEL || 'info',
				stream: process.stdout
			}
		]
	});

	// Capture and report unhandled exceptions
	ravenClient.patchGlobal();

} else if (process.env.NODE_ENV === 'test') {
	logger = bunyan.createLogger({
		name: 'buildservice-test',
		streams: [
			{
				level: 'fatal',
				stream: process.stdout
			}
		]
	});

} else {
	logger = bunyan.createLogger({
		name: 'buildservice-dev',
		streams: [
			{
				level: process.env.LOG_LEVEL || 'info',
				stream: process.stdout
			}
		]
	});
}

process.on('unhandledRejection', function(err, p){
    logger.error({promise: p, error: err.stack || err}, 'Unhandled Rejection');
});

logger.ravenClient = ravenClient;

module.exports = logger;
