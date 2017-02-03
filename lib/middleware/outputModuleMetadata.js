'use strict';

const createRouteHandler = require('../express/promisehandler');
const InstallationManager = require('../installationmanager');
const Bundler = require('../bundler');
const ModuleMetadata = require('../modulemetadata');
const cacheControlHeaderFromExpiry = require('../utils/cacheControlHeaderFromExpiry');
const metrics = require('../monitoring/metrics');

module.exports = app => {

	const moduleMetadata = new ModuleMetadata({
		bundler: new Bundler(),
		installationManager: new InstallationManager({
			temporaryDirectory: app.origami.options.tempdir
		})
	});

	return createRouteHandler(({params:{module}}, res) => {

		return moduleMetadata.getContent(module)
			.then(metadata => {
				if (res.headersSent || res._buildservice_last_error) {
					const err = new Error('successful metadata response after headers written?');
					err.context = res;
					throw err;
				}

				const headers = {
					'Content-Type': 'application/json;charset=UTF-8',
				};

				// expiryTime and createdTime are exposed only via HTTP, not JSON
				if (metadata.expiryTime) {
					headers['Cache-Control'] = cacheControlHeaderFromExpiry(metadata.expiryTime);
					delete metadata.expiryTime;
				}
				if (metadata.createdTime) {
					headers['Last-Modified'] = new Date(metadata.createdTime).toUTCString();
					delete metadata.createdTime;
				}

				metrics.counter('routes.meta.serve').inc();

				res.writeHead(200, headers);
				res.end(JSON.stringify(metadata, undefined, 1));
			});
	});

};
