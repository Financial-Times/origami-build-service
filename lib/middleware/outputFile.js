'use strict';

const createRouteHandler = require('../express/promisehandler');
const Q = require('../utils/q');
const URL = require('url');
const HTTPError = require('../express/httperror');
const metrics = require('../monitoring/metrics');
const utils = require('../utils');
const FileProxy = require('../fileproxy');
const InstallationManager = require('../installationmanager');

module.exports = function(app) {
	const fileProxy = new FileProxy({
		installationManager: new InstallationManager({
			temporaryDirectory: app.origami.options.tempdir
		}),
		registry: app.origami.options.registry
	});

	return createRouteHandler(Q.async(function*(req, res) {
		const url = URL.parse(req.originalUrl);
		let fileInfo;
		try {
			fileInfo = yield fileProxy.getFileInfo(url);
		} catch(e) {
			if (e instanceof HTTPError) {
				metrics.counter('routes.files.error').inc();
				throw e;
			}

			const tmp = new Error('Can\'t get info about file from URL \'' + url.href + '\': ' + e.message);
			tmp.parentError = e;
			tmp.code = e.code;
			throw tmp;
		}

		const headers = {
			'Content-Type': fileInfo.mimeType,
			'Last-Modified': fileInfo.mtime.toUTCString(),
			'Cache-Control': utils.cacheControlHeaderFromExpiry(fileInfo.expiryTime),
			'Access-Control-Allow-Origin': '*',
		};

		const doVersionLock = /^text\/html\b/.test(fileInfo.mimeType) && fileInfo.size < 5000000;
		// version locking rewrites the file, so length will be different
		if (!doVersionLock) {
			headers['Content-Length'] = fileInfo.size;
		}

		if (req.method === 'HEAD' || req.headers['if-modified-since'] === headers['Last-Modified']) {
			metrics.counter('routes.files.notmodifed').inc();
			res.writeHead(req.method === 'HEAD' ? 200 : 304, headers);
			res.end();
		} else {
			metrics.counter('routes.files.serve').inc();
			const fileContent = yield fileProxy.getContent(fileInfo, doVersionLock, req.url);
			if (Buffer.isBuffer(fileContent)) {
				headers['Content-Length'] = fileContent.length;
				res.writeHead(200, headers);
				res.end(fileContent);
			} else {
				res.writeHead(200, headers);
				fileContent.pipe(res);
			}
		}
	}));

};
