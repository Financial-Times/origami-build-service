'use strict';

const fs = require('fs');
const URL = require('url');
const querystring = require('querystring');
const mime = require('mime');
const Q = require('./utils/q');
const pfs = require('q-io/fs');
const cheerio = require('cheerio');
const ModuleSet = require('./moduleset');
const HTTPError = require('./express/httperror');
const hostnames = require('./utils/hostnames');

function FileProxy(options) {
	options = options || {};
	this.registry = options.registry;
	this.installationManager = options.installationManager;
}

FileProxy.prototype = {
	getContent: Q.async(function*(fileInfo, doVersionLock, reqUrl) {
		if (doVersionLock) {
			const installed = yield fileInfo.installation.list(fileInfo.moduleset);
			const componentName = Object.keys(installed)[0];
			return new Buffer(this.versionLockBuildserviceUrls(yield pfs.read(fileInfo.path), componentName, installed[componentName].version, 'https://' + hostnames.preferred + reqUrl));
		} else {
			return fs.createReadStream(fileInfo.path);
		}
	}),

	/**
	 * Modify all URLs pointing to buildservice bundles and change versionless module references to use the given version.
	 * This allows static HTML of demos to always use correct version, see Redmine #20712
	 *
	 * @param  {String} html          Markup to modify
	 * @param  {String} moduleName    Module name to change
	 * @param  {String} actualVersion Version string to append
	 * @return {String}
	 */
	versionLockBuildserviceUrls: function(html, componentName, actualVersion, baseURL) {
		const $ = cheerio.load(html);
		let changed = false;

		const rewriteAttr = function(attrName, i, node) {
			const attr = $(node).attr(attrName);
			const lockedAttr = this._versionLockUrl(attr, componentName, actualVersion, baseURL);
			if (lockedAttr === attr) return;
			changed = true;
			$(node).attr(attrName, lockedAttr);
		}.bind(this);

		$('link[href]').each(rewriteAttr.bind(this, 'href'));
		$('script[src]').each(rewriteAttr.bind(this, 'src'));

		return changed ? $.html() : html;
	},

	_versionLockUrl: function(urlStr, componentName, actualVersion, baseURL) {
		const url = URL.parse(URL.resolve(baseURL, urlStr), true, true);
		const isKnownHost = hostnames.known.some(knownHost => {
			return (
				`${url.hostname}${url.path}`.indexOf(knownHost) !== -1 ||
				`${url.hostname}`.indexOf(knownHost) !== -1
			);
		});

		if (isKnownHost && /\/bundles\/(?:css|js)\?/.test(url.path)) {
			if (url.query.modules) {
				const moduleset = new ModuleSet(url.query.modules.split(','));
				moduleset.getResolvedModules().forEach(function(m){
					if (m.endpoint.name === componentName && m.endpoint.target === '*') {
						m.endpoint.target = actualVersion;
					}
				});
				url.query.modules = moduleset.toFullModuleNames().join(',');
			}
			delete url.search; // takes precedence over .query

			delete url.protocol; // generate protocol-relative URLs
			url.slashes = true;

			return URL.format(url);
		}
		return urlStr;
	},

	/**
	 * Maps URL to file in a module and returns path/type/stats for the file
	 */
	getFileInfo: Q.async(function*(url) {
		const match = url.pathname.match(/\/files\/([^\/]+)\/(.*)$/);
		if (!match) throw new HTTPError(404, 'Invalid URL');

		const fullModuleName = querystring.unescape(match[1]);
		const relPath = querystring.unescape(match[2]);

		const moduleset = new ModuleSet([fullModuleName]);
		const componentName = moduleset.getResolvedModules()[0].endpoint.name;
		const installation = yield this.installationManager.createInstallation(moduleset, {});

		const absPath = installation.getPathToComponentsFile(componentName, relPath);

		if (this.registry) {
			const manifest = yield installation.getBowerManifest(componentName); // manifest._source is faster than installation.list()
			let packageListByURL;
			try {
				packageListByURL = yield this.registry.packageListByURL;
			} catch(e) {
				const tmp = new HTTPError(503, 'Unable to read packages from \'' + this.registry.baseURL + '\': ' + e.message);
				tmp.parentError = e;
				throw tmp;
			}

			// Can't just check for hostname match, because the registry contains packages from github.com, so checking full URL.
			// Assuming exact comparison works, because there are no redirects, redundant port numbers, etc. in the URLs.
			if (!packageListByURL[manifest._source]) {
				throw new HTTPError(403, 'Refusing to serve files from \'' + componentName + '\', because \'' + manifest._source +
					'\' is not in the (cached) list of known packages at \'' + this.registry.baseURL + '\'.\n');
			}
		}

		try {
			const stat = yield pfs.stat(absPath);
			if (!stat.isFile()) throw new Error();

			return {
				path: absPath,
				mimeType: mime.lookup(absPath),
				mtime: stat.lastModified(),
				size: stat.size,
				expiryTime: installation.expiryTime,
				moduleset: moduleset,
				installation: installation,
			};
		} catch(e) {
			throw new HTTPError(moduleset.hasExactVersionsOnly() ? 410 : 404, 'The path ' + relPath + ' does not exist in the repo');
		}
	})
};

module.exports = FileProxy;
