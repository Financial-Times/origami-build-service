'use strict';

const URL = require('url');
const querystring = require('querystring');
const Q = require('./utils/q');
const ModuleSet = require('./moduleset');
const InstallationManager = require('./installationmanager');
const Bundler = require('./bundler');
const FileProxy = require('./fileproxy');
const ModuleMetadata = require('./modulemetadata');
const utils = require('./utils');
const HTTPError = require('./express/httperror');
const CompileError = require('./utils/compileerror');
const metrics = require('./monitoring/metrics');
const stringToBoolean = require('./utils/string-to-boolean');
const path = require('path');

const oneHourMSec = 3600 * 1000;
const timeoutDurationMSec = 20000;
const maxBuildTimeMSec = 60000;

function getBundleDetails(req) {
	if (!req.query.modules) {
		throw new HTTPError(400, 'Missing \'modules\' query argument');
	}
	if (typeof req.query.modules !== 'string') {
		throw new HTTPError(400, 'The \'modules\' query argument must be a comma-separated list of modules');
	}

	const modules = req.query.modules.split(/\s*,\s*/);

	// Developer may either set autoinit query param or might add o-autoinit to their module list
	const autoinitIncluded = !!modules.filter(function(x) { return x.indexOf('o-autoinit') !== -1; }).length;
	if (req.query['autoinit'] !== '0' && !autoinitIncluded) {
		modules.push('o-autoinit@^1.0.0');
	}

	return {
		babelRuntime:       req.query.polyfills ? stringToBoolean(req.query.polyfills) : true,
		newerThan:          req.query.newerthan ? Date.parse(req.query.newerthan) : false,
		modules:            new ModuleSet(modules),
		versionLocks:       req.query.shrinkwrap ? new ModuleSet(req.query.shrinkwrap.split(/\s*,\s*/)) : false,
		minify:             !(req.query.minify && req.query.minify === 'none'),
		exportName:         (req.query['export'] === undefined) ? 'Origami' : req.query['export']
	};
}

function BuildSystem(options) {
	this.defaultExport = options['export'];
	this.httpProxyTtl = 12 * oneHourMSec;

	this.installationManager = new InstallationManager({
		temporaryDirectory: options.tempdir
	});

	this.bundler = new Bundler();
	this.fileProxy = new FileProxy({
		installationManager: this.installationManager,
		registry: options.registry
	});
	this.moduleMetadata = new ModuleMetadata({
		bundler: this.bundler,
		installationManager: this.installationManager
	});
}

BuildSystem.prototype = {

	/**
	 * Stream JS or CSS bundle to the HTTP response or
	 * Stream compiled demo Mustache templates to the HTTP response
	 */
	outputBundle: function(type, req, res, next) {
		const url = URL.parse(req.originalUrl);
		let bundleDetails;
		let moduleset;
		let moduleInstallationPromise;
		if (type === 'demo') {
			const match = url.pathname.match(/\/demos\/([^\/]+)\/([^\/]+)$/);
			if (!match) throw new HTTPError(404, 'Invalid URL');

			const fullModuleName = querystring.unescape(match[1]);
			const demoName = querystring.unescape(match[2]);

			bundleDetails = {
				demoName: demoName,
				reqUrl: req.url
			};
			moduleset = new ModuleSet([fullModuleName]);
			moduleInstallationPromise = this.installationManager.createInstallation(moduleset, {});
		} else {
			bundleDetails = getBundleDetails(req);
			moduleset = bundleDetails.modules;
			moduleInstallationPromise = this.installationManager.createInstallation(moduleset, bundleDetails);
		}

		// If bundle takes a long time to generate, issue a redirect response to reconnect -
		// this avoids short request timeouts in Heroku and other possible intermediary nodes.
		// Also when running multiple build service nodes, this provides an opportunity to
		// connect to a different backend that may already have the bundle in cache
		return Promise.race([
			this.bundler.getBundle(type, moduleInstallationPromise, moduleset, bundleDetails),
			promiseTimeout(timeoutDurationMSec)
		]).then(function(bundle) {

			// If request went via any redirects, redirect one final time to the canonical URL to enable response to be cached efficiently and avoid caching URLs containing `redirects` args
			if (req.query.redirects) {
				delete req.query.redirects;
				metrics.counter('routes.bundle.redirect').inc();
				res.redirect(307, selfURL(req));
			} else {
				res.set({
					'Content-Type': bundle.mimeType,
					'Last-Modified':  new Date(bundle.createdTime).toUTCString(),
					'Cache-Control': utils.cacheControlHeaderFromExpiry(bundle.expiryTime)
				});

				if (req.query.shrinkwrap) {
					metrics.counter('routes.bundle.serveShrinkWrapped').inc();
				}
				metrics.counter('routes.bundle.serve').inc();
				bundle.pipe(res).end();
			}
			next(); // AB: Why are we calling next() here?
		}).catch(function(error) {
			if (error === 'timeout') {
				req.query.redirects = parseInt(req.query.redirects || 0, 10) + 1;
				if ((req.query.redirects * timeoutDurationMSec) > maxBuildTimeMSec) {
					metrics.counter('routes.bundle.timeout').inc();
					next(new CompileError('Maximum allowable build time exceeded'));
				} else {
					res.redirect(307, selfURL(req));
				}
			} else {
				// Pass on any real errors so Express can convert them into an appropriate HTTP response
				metrics.counter('routes.bundle.error').inc();
				next(error);
			}
		});
	},

	/**
	 * Sends JSON with module metadata to the HTTP response
	 * @param  {Object} url parsed /modules/**
	 * @param  {Object} req HTTP Request
	 * @param  {Object} res HTTP Response
	 * @return {Promise}
	 */
	outputModuleMetadata: function(req, res) {
		const match = req.path.match(/^(?:\/(v1|v2))?\/modules\/([^\/]+)/);
		if (!match || !match[2]) {
			throw new HTTPError(404, 'Invalid URL');
		}
		const fullModuleName = querystring.unescape(match[2]);

		return this.moduleMetadata.getContent(fullModuleName)
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
					headers['Cache-Control'] = utils.cacheControlHeaderFromExpiry(metadata.expiryTime);
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
	},

	outputFile: Q.async(function*(req, res) {
		const url = URL.parse(req.originalUrl);
		let fileInfo;
		try {
			fileInfo = yield this.fileProxy.getFileInfo(url);
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
			const fileContent = yield this.fileProxy.getContent(fileInfo, doVersionLock, req.url);
			if (Buffer.isBuffer(fileContent)) {
				headers['Content-Length'] = fileContent.length;
				res.writeHead(200, headers);
				res.end(fileContent);
			} else {
				res.writeHead(200, headers);
				fileContent.pipe(res);
			}
		}
	})
};

function promiseTimeout(duration) {
	return new Promise(function(resolve, reject) {
		setTimeout(reject, duration, 'timeout');
	});
}

function selfURL(req) {
	const qs = querystring.stringify(req.query);
	return path.join(req.basePath, req.path) + '?' + qs;
}

module.exports = BuildSystem;
