'use strict';

const Q = require('./utils/q');
const fs = require('fs-extra');
const tryall = require('tryall');
const ModuleSet = require('./moduleset');
const UserError = require('./utils/usererror');

function ModuleMetadata(options) {
	this.bundler = options.bundler;
	this.log = options.log;
	this.installationManager = options.installationManager;
}

ModuleMetadata.prototype = {

	_getFileFromList: Q.async(function*(filenames, module, installation) {
		for(const i in filenames) {
			if (Object.prototype.hasOwnProperty.call(filenames, i)) {
				const path = installation.getPathToComponentsFile(module.endpoint.name, filenames[i]);
				if (yield fs.pathExists(path)) {
					const fileContents = yield fs.readFile(path, 'utf8');
					return fileContents;
				}
			}
		}

		return false;
	}),

	/**
	 * Fetch module, test whether it builds, include manifests, readme, etc.
	 */
	getContent: Q.async(function* (fullModuleName, brand, source) {
		const log = this.log;
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

			const installation = yield installationPromise;
			const components = yield installation.listAllOrigamiComponents();

			for (const [name, properties] of Object.entries(components)) {
				let unsupportedComponent = false;

				try {
					const manifest = yield installation.getOrigamiManifest(name);
					const specVersion = manifest.origamiVersion;
					unsupportedComponent = specVersion > 1;
				} catch (e) { }

				if (unsupportedComponent) {
					const componentVersion = properties.version;
					return Promise.reject(new UserError(`${name}@${componentVersion} is not an Origami v1 component, the Origami Build Service v2 module API only supports Origami v1 components.\n\nIf you want to use Origami v2 components you will need to use the Origami Build Service v3 API`));
				}
			}

			metadata.build.bundler = { valid:true };

			// Builds CSS and JS in parallel, allows either to fail without throwing
			yield tryall(['js', 'css'].map(function(type) {
				const bundlePromise = this.bundler.getBundle(type, installationPromise, moduleset, {
					minify: 'none',
					brand,
					source
				});

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
				log.trace(err);
				metadata.build.origami = responseFromError(err);
			}

			// Saves Origami Registry hassle of finding and downloading the README.
			const readmeFilenames = ['README.md', 'readme.md', 'README', 'readme.txt', 'README.txt'];
			metadata.readme = yield this._getFileFromList(readmeFilenames, module, installation);

			const designGuidelinesFilenames = ['designguidelines.md', 'usage.md', 'examples.md', 'demos.md'];
			metadata.designGuidelines = yield this._getFileFromList(designGuidelinesFilenames, module, installation);

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
