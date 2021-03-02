'use strict';

const URL = require('url');
const HTTPError = require('../express/httperror');
const cacheControlHeaderFromExpiry = require('../utils/cacheControlHeaderFromExpiry');
const FileProxy = require('../fileproxy');
const InstallationManager = require('../installationmanager');
const UserError = require('../utils/usererror');

module.exports = app => {
	const {metrics, options} = app.ft;

	const fileProxy = new FileProxy({
		installationManager: new InstallationManager({
			log: options.log,
			metrics: metrics,
			temporaryDirectory: options.tempdir
		}),
		registry: options.registry
	});

	return (request, response, next) => {
		const url = URL.parse(request.originalUrl);
		return fileProxy.getFileInfo(url)
			.then(fileInfo => {
				const headers = {
					'Content-Type': fileInfo.mimeType,
					'Last-Modified': fileInfo.mtime.toUTCString(),
					'Cache-Control': cacheControlHeaderFromExpiry(fileInfo.expiryTime),
					'Access-Control-Allow-Origin': '*',
				};

				const doVersionLock = /^text\/html\b/.test(fileInfo.mimeType) && fileInfo.size < 5000000;
				// version locking rewrites the file, so length will be different
				if (!doVersionLock) {
					headers['Content-Length'] = fileInfo.size;
				}

				if (request.method === 'HEAD' || request.headers['if-modified-since'] === headers['Last-Modified']) {
					metrics.count('routes.files.notmodifed', 1);
					response.writeHead(request.method === 'HEAD' ? 200 : 304, headers);
					response.end();
				} else {
					metrics.count('routes.files.serve', 1);
					return fileProxy.getContent(fileInfo, doVersionLock, request.url)
						.then(fileContent => {
							if (Buffer.isBuffer(fileContent)) {
								headers['Content-Length'] = fileContent.length;
								response.writeHead(200, headers);
								response.end(fileContent);
							} else {
								response.writeHead(200, headers);
								fileContent.pipe(response);
							}
						});
				}
			}, error => {
				if (error instanceof HTTPError || error instanceof UserError) {
					metrics.count('routes.files.error', 1);
					throw error;
				}
				const outputFileError = new Error('Can\'t get info about file from URL \'' + url.href + '\': ' + error.message);
				outputFileError.parentError = error;
				outputFileError.code = error.code;
				throw outputFileError;
			})
			.catch(function(err) {
				next(err);
			});
	};

};
