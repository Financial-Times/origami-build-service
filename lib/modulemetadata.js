'use strict';

const Q = require('./utils/q');
const pfs = require('q-io/fs');
const tryall = require('tryall');
const ModuleSet = require('./moduleset');
const log = require('./utils/log');

function ModuleMetadata(options) {
	this.bundler = options.bundler;
	this.installationManager = options.installationManager;
}

ModuleMetadata.prototype = {
	/**
	 * Fetch module, test whether it builds, include manifests, readme, etc.
	 */
	getContent: Q.async(function*(fullModuleName) {

		const moduleset = new ModuleSet([fullModuleName]);
		const module = moduleset.getResolvedModules()[0];

		const metadata = {
			build: {},
			bowerEndpoint: module.endpointString,
			expiryTime: Date.now(),
		};

		const responseFromError = function(err) {
			return {
				valid: false,
				code: err.code,
				error: err.message + (err.details ? '\n' + err.details : ''),
			};
		};

		try {
			const installationPromise = this.installationManager.createInstallation(moduleset, {});

			metadata.build.bundler = { valid:true };

			// Builds CSS and JS in parallel, allows either to fail without throwing
			yield tryall(['js', 'css'].map(function(type) {
				const bundlePromise = this.bundler.getBundle(type, installationPromise, moduleset, { minify: 'none' });

				return bundlePromise.then(function(bundle) {
					const streamFinished = Q.bufferStream(bundle.stream);
					return streamFinished.then(function(data) {
						metadata.build[type] = { valid: true, bundleSize: data.length };
						return true;
					});
				}).catch(function(err) {
					metadata.build[type] = responseFromError(err);
					return false;
				}.bind(this));
			}.bind(this)));

			const installation = yield installationPromise;

			metadata.bowerManifest = yield installation.getBowerManifest(module.endpoint.name);
			metadata.expiryTime = installation.expiryTime;
			metadata.createdTime = installation.createdTime;

			try {
				const origamiManifest = yield installation.getOrigamiManifest(module.endpoint.name);
				if (null !== origamiManifest) {
					metadata.origamiManifest = origamiManifest;
					metadata.build.origami = {valid:true};
				}
			} catch(err) {
				log.debug(err);
				metadata.build.origami = responseFromError(err);
			}

			// Saves Origami Registry hassle of finding and downloading the README.
			// TODO:KL: instead of mixing text/markdown add type information or convert all to text/html
			const filenames = ['README.md', 'readme.md', 'README', 'readme.txt', 'README.txt'];
			for(let i in filenames) {
				if (filenames.hasOwnProperty(i)) {
					const path = installation.getPathToComponentsFile(module.endpoint.name, filenames[i]);
					if (yield pfs.exists(path)) {
						metadata.readme = yield pfs.read(path);
						break;
					}
				}
			}

		} catch(e) {
			// if top-level module is not found that's 404 for the entire API
			const endpoint = e.endpoint || (e.data && e.data.endpoint);
			if (e.code === 'ENOTFOUND' && endpoint && endpoint.source === module.endpoint.source) {
				throw e;
			}
			metadata.build.bundler = responseFromError(e);
		}

		return metadata;
	})
};

module.exports = ModuleMetadata;
