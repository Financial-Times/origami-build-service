'use strict';

const InstallationManager = require('../installationmanager');
const Bundler = require('../bundler');
const ModuleMetadata = require('../modulemetadata');
const cacheControlHeaderFromExpiry = require('../utils/cacheControlHeaderFromExpiry');

module.exports = app => {
	const {metrics, options} = app.origami;

	const moduleMetadata = new ModuleMetadata({
		log: options.log,
		bundler: new Bundler(Object.assign({}, options, {metrics})),
		installationManager: new InstallationManager({
			log: options.log,
			metrics: metrics,
			temporaryDirectory: options.tempdir
		})
	});

	return (req, res, next) => {
		const module = req.params.module;
		const brand = req.query['brand'] || 'master';
		return moduleMetadata.getContent(module, brand)
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

				metrics.count('routes.meta.serve', 1);

				res.writeHead(200, headers);
				res.end(JSON.stringify(metadata, undefined, 1));
			})
			.catch(function(err) {
				next(err);
			});
	};

};
