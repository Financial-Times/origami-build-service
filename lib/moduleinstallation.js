'use strict';

const bower = require('bower');
const EndpointParser = require('bower-endpoint-parser');
const Q = require('./utils/q');
const pfs = require('fs-extra-p');
const URL = require('url');
const path = require('path');
const glob = Q.denodeify(require('glob'));
const rmrf = Q.denodeify(require('rimraf'));
const HTTPError = require('./express/httperror');
const Registry = require('./registry');
const filterAsync = require('./utils/filterAsync');

const oneDayCacheTime = 24*3600*1000;

const negateAsync = (func) => (...args) => func(...args)
	.then((result) => !result);

/**
 * To prevent internal modules from being leaked only whitelisted hosts can be used to install arbitrary components.
 * All other components must have origami.json file (the assumption is that all Origami modules are public).
 * Blacklist would be risky: could be bypassed by accessing internal server by IP or using another hostname,
 * and hostname verification post install could by bypassed with DNS rebinding attack.
 */
const nonOrigamiWhitelist = { 'github.com': true };

/**
 * Creates new ModuleInstallation that manages a single bower_components directory
 *
 * @param {Object} options
 */
function ModuleInstallation(moduleset, options) {
	if (!process.env['GIT_ASKPASS']) {
		process.env.GIT_ASKPASS = 'true'; // must be set to prevent git from getting stuck on an interactive prompt ("true" here is /bin/true)
	}

	this.moduleSet = moduleset;
	this.createdTime = Date.now();
	this.registry = options.registry || new Registry();
	this.options = options;
	this.log = this.options.log;
	this._listCache = null;

	this.dirInit = Q.async(function*(){
		const dir = this.options.dir;
		yield pfs.ensureDir(dir);
		this.options.dir = yield pfs.realpath(dir);
	}).call(this);

	this.installationTtl = oneDayCacheTime;
	this.installationTtlExact = 30 * oneDayCacheTime;
}

ModuleInstallation.prototype = {
	get expiryTime() {
		return this.createdTime + this.getTTL();
	},

	getTTL: function() {
		// allow longer caching of bundles with precise version, because they won't be upgraded
		// (although not infinite cache here to prevent garbage from accumulating)
		return this.moduleSet.hasExactVersionsOnly() ? this.installationTtlExact : this.installationTtl;
	},

	install: Q.async(function*() {
		const log = this.log;
		this._listCache = null;

		try {
			yield this.dirInit; // wait for the dir to be created/normalized

			const modules = this.moduleSet.getResolvedModules();
			yield this._addModulesToBowerManifest(modules);
			const installPromise = Q.getStreamEnd(bower.commands.install([], { save: false }, this.getConfig()));

			installPromise.progress(function(logMsg) {
				if (logMsg.level !== 'info' && logMsg.level !== 'warn' && logMsg.level !== 'action') {
					log.trace({bowerLogEvent: logMsg}, 'Bower log event');
				}
			});

			const installed = yield installPromise;
			yield this._ensureOnlyWhitelistedModulesInstalled(installed);

			log.trace({dest: this.options.dir}, 'Completed module install');
			return installed;
		} catch(err) {
			this.rethrowSanitizedError(err);
		}
	}),

	_addModulesToBowerManifest: Q.async(function*(modules) {
		const log = this.log;
		const manifestPath = path.join(this.options.dir, 'bower.json');

		let bowerManifest;
		if (yield pfs.pathExists(manifestPath)) {
			bowerManifest = JSON.parse(yield pfs.readFile(manifestPath, 'utf8'));
			if ('object' !== typeof bowerManifest.dependencies) {
				bowerManifest.dependencies = {};
			}
			modules.forEach(function(m){
				delete bowerManifest.dependencies[m.endpoint.name]; // overwrite modules from existing manifest
			});
		} else {
			bowerManifest = {
				'name':'__MAIN__',
				'dependencies': {},
			};
		}

		// bower install with list of URLs can't resolve versions properly.
		// It's neccessary to create a temporary manifest file.
		modules.forEach(function(m){
			const name = m.endpoint.name;
			if (!name) throw new Error('Internal error, missing name for: ' + m.moduleName); // just a sanity check. ModuleSet should never allow it.

			// Can't use m.endpointString, because it could contain the name, and Bower doesn't like that
			let endpointString = EndpointParser.compose({source:m.endpoint.source, target:m.endpoint.target});

			// Target is required for non-URL modules, otherwise bower interprets them as branch/version name
			if (endpointString.indexOf('#') < 0) endpointString += '#*';

			if (bowerManifest.dependencies[name] && bowerManifest.dependencies[name] !== endpointString) {
				throw new HTTPError(400, 'Module '+name+' (' + m.moduleName + ') has been specified more than once:\n - ' +
					endpointString + '\n - ' + bowerManifest.dependencies[name]);
			}
			bowerManifest.dependencies[name] = endpointString;
		});

		log.info({modules: bowerManifest.dependencies, dest: this.options.dir}, 'Installing a new module set');

		return pfs.outputFile(manifestPath, JSON.stringify(bowerManifest));
	}),

	/**
	 * Get hostname from the URL (including git-specific URLs). It's used for the whitelist, so must be strict for security.
	 * Returns null if URL is a path or is invalid.
	 *
	 * @param  {String} urlstr URL
	 * @return {String}
	 */
	_getHostname: function(urlstr) {
		const url = URL.parse(urlstr);
		if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'git:' || url.protocol === 'ssh:') {
			return url.hostname;
		}

		// git accepts unusual URLs in format user@host:path
		const m = urlstr.match(/^(git@[a-zA-Z0-9.]+):(.*)/);
		if (m) {
			const giturl = URL.parse('git:' + m[1] + '/' + m[2]);
			return giturl.hostname;
		}
		return null;
	},

	/**
	 * Checks where the modules have been installed from and rejects if they're not Origami modules and haven't been installed from whitelist of domains.
	 */
	_ensureOnlyWhitelistedModulesInstalled: Q.async(function*(installed){
		const log = this.log;
		for(const componentName in installed) {
			if (Object.protoype.hasOwnProperty.call(installed, componentName)) {
				const url = installed[componentName].pkgMeta._source;
				const hostname = this._getHostname(url);
				if (!hostname || !nonOrigamiWhitelist[hostname]) {
					const manifestPath = yield this._origamiManifestPathForDirectory(installed[componentName].canonicalDir);
					if (!manifestPath) {
						const msg = componentName + ' is not an Origami module and ' + (hostname || 'local path') + ' is not allowed to host non-Origami modules.\n' +
							'If you want to host ' + componentName + ' on ' + (hostname || 'local path') + ' you must add origami.json to the repository.\n' +
							'If you don\'t want to add origami.json, then you must host ' + componentName + ' on ' + Object.keys(nonOrigamiWhitelist).join(' or ') + '.';
						log.error(msg);
						this.destroy();
						throw new HTTPError(403, msg, 'EMISSINGORIGAMICONFIG');
					}
				}
			}
		}
	}),

	/**
	 * Object with all installed components as properties and array of main files/globs as values.
	 *
	 * @return {Object}
	 */
	_getAllMainPathGlobs: Q.async(function*() {
		yield this.dirInit;

		const config = this.getConfig();
		config.offline = true;

		const installed = yield Q.getStreamEnd(bower.commands.list({paths:true, relative:false}, config));

		for(const componentName in installed) {
			if ('string' === typeof installed[componentName]) {
				installed[componentName] = [installed[componentName]];
			}
		}
		return installed;
	}),

	/**
	 * Returns the modules returned by the given list promise, filtered by the given predicate
	 *
	 * @return {Promise}
	 */
	_listFilteredComponents(listPromise, componentFilter) {
		return listPromise.then((components) => {
			return filterAsync(Object.keys(components), componentFilter)
				.then(function(filteredComponents) {
					// The filter operates on the keys Object.keys.  This converts back to the original objects
					return filteredComponents.reduce(function(result, component) {
						result[component] = components[component];
						return result;
					}, {});
				});
		});
	},

	/**
	 * Returns map of all installed non-Origami packages (directly and dependencies) with their version, main files/dir, etc.
	 *
	 * @return {Promise}
	 */
	listDirectNoneOrigamiComponents() {
		return this._listFilteredComponents(this.list(), negateAsync(this.hasOrigamiManifest.bind(this)));
	},

	/**
	 * Returns map of all directly installed non-Origami packages with their version, main files/dir, etc.
	 *
	 * @return {Promise}
	 */
	listAllOrigamiComponents() {
		return this._listFilteredComponents(this.listAll(), this.hasOrigamiManifest.bind(this));
	},

	/**
	 * Returns map of all installed packages (directly and dependencies) with their version, main files/dir, etc.
	 *
	 * @return {Promise}
	 */
	listAll: function() {
		if (!this._listCache) {
			this._listCache = this._listComponents();
		}

		return this._listCache;
	},

	/**
	 * Returns map of all directly installed packages with their version, main files/dir, etc.
	 *
	 * @return {Promise}
	 */
	list: function() {
		return this.listAll().then((allComponents) => {
			return this.moduleSet.getResolvedModules().reduce((components, m) => {
				const name = m.endpoint.name;
				if (allComponents[name]) {
					components[name] = Object.assign({
						moduleName: m.moduleName,
						mainPathOverride: m.mainPathOverride,
					}, allComponents[name]);
					if (!components[name].source) components[name].source = m.endpoint.source; // that's only a fallback, because endpoint.source is not resolved
				}
				return components;
			}, {});
		});
	},

	getInstalledInModuleset: Q.async(function*(moduleSet) {
		const allComponents = yield this.listAll();

		return moduleSet.getResolvedModules()
			.filter(m => m.endpoint.name in allComponents)
			.reduce(function(obj, module) {
				obj[module.endpoint.name] = Object.assign({
					moduleName: module.moduleName,
					mainPathOverride: module.mainPathOverride
				}, allComponents[module.endpoint.name]);
				return obj;
			}, {});
	}),

	_listComponents: Q.async(function*(){
		const mainPathGlobs = yield this._getAllMainPathGlobs();

		const listed = {};
		for(const componentName in mainPathGlobs) {
			if (Object.protoype.hasOwnProperty.call(mainPathGlobs, componentName)) {
				const manifest = yield this.getBowerManifest(componentName);

				const paths = yield this._globsToPaths(mainPathGlobs[componentName], componentName);
				const files = [];
				for(const j in paths) {
					// installed component may only give path to top-level directory
					// in that case check if there's main.js/main.css/main.scss and use that instead
					if ((yield pfs.stat(paths[j])).isDirectory()) {
						yield Q.all(['js','css','scss'].map(function(extension){
							const mainPath = paths[j] + '/main.' + extension;
							return pfs.pathExists(mainPath).then(function(exists){
								if (exists) files.push(mainPath);
							});
						}));
					} else {
						files.push(paths[j]);
					}
				}

				listed[componentName] = {
					paths: files.length ? files : paths, // keep dirs if component doesn't have any main.* files
					variablePrefixName: (manifest.name || componentName), // components can be installed under any name, but Sass self-references expect original name
					version: manifest.version,
					target: manifest._target,
					source: manifest._source,
					originalSource: manifest._originalSource,
					commit: (manifest._resolution ? manifest._resolution.commit : null)
					// mainPathOverride can't be exposed here, because the install is shared between overriden and non-overriden sets
				};
			}
		}
		return listed;
	}),

	/**
	 * Converts array of globs ["*.js"] to array of real paths ["foo.js", "bar.js"]
	 *
	 * @param  {Array} globs patterns to match
	 * @return {Array}
	 */
	_globsToPaths: Q.async(function*(globs, componentName) {
		const log = this.log;
		const globOptions = {
			dot: false, // * should not match dotfiles
			cwd: this.options.dir,
			nomount: true,
			nosort: true,
			silent: true,
		};

		const paths = [];
		for(const i in globs) {
			if (Object.protoype.hasOwnProperty.call(globs, i)) {
				const matched = yield glob(globs[i], globOptions);
				if (!matched.length) {
					log.warn({glob:globs[i], component:componentName}, 'Missing main');
				}
				for(const j in matched) {
					if (Object.protoype.hasOwnProperty.call(matched, j)) {
						paths.push(matched[j]);
					}
				}
			}
		}
		return paths;
	}),

	/**
	 * Test if the installation appears to be correct, throw if fatal errors are found
	 *
	 * @return void
	 */
	verify: function() {
		return Q.all(this.moduleSet.getResolvedModules().map(function(module){
			return this.getBowerManifest(module.endpoint.name);
		}, this)).then(function(){
			return true;
		});
	},

	/**
	 * Local filesystem path to file in installed component
	 *
	 * @param  {string} componentName Name of bower component
	 * @param  {string} relPath       Any path. It's sanitized, so '../../etc' is safe
	 * @return {string}
	 */
	getPathToComponentsFile: function(componentName, relPath) {
		return this.getComponentDir(componentName) + path.normalize('/' + relPath);
	},

	getBowerComponentsDir: function() {
		return this.options.dir + '/bower_components';
	},

	getDirectory: function() {
		return this.options.dir;
	},

	getComponentDir: function(componentName) {
		return this.getBowerComponentsDir() + path.normalize('/' + componentName);
	},

	destroy: function() {
		const dir = this.options.dir;
		this.options = null; // make the object unusable
		return rmrf(dir);
	},

	getBowerManifest: function(installedBowerComponentName) {
		const componentPath = this.getComponentDir(installedBowerComponentName);
		return pfs.readFile(componentPath + '/.bower.json', 'utf8')
			.then(function(json){
				return JSON.parse(json);
			});
	},

	/**
	 * Returns path if it exists or null if it's not an Origami module
	 *
	 * @param  {String} dir Installation directory of the component
	 * @return {String}
	 */
	_origamiManifestPathForDirectory: Q.async(function*(dir) {
		const newPath = dir + '/origami.json';
		if (yield pfs.pathExists(newPath)) return newPath;

		const oldPath = dir + '/.origamiconfig'; // backward compat only
		if (yield pfs.pathExists(oldPath)) return oldPath;

		return null;
	}),

	/**
	 * Returns object parsed from origami.json file or null if package doesn't have it.
	 *
	 * @return {Object}
	 */
	getOrigamiManifest: Q.async(function*(componentName) {
		try {
			const hasManifest = yield this.hasOrigamiManifest(componentName);
			if (!hasManifest) return null;

			return JSON.parse(yield pfs.readFile(yield this.getOrigamiManifestPath(componentName), 'utf8'));
		}
		catch(e) {
			this.rethrowSanitizedError(e);
		}
	}),

	getOrigamiManifestPath: Q.async(function*(componentName) {
		const dir = this.getComponentDir(componentName);
		const path = yield this._origamiManifestPathForDirectory(dir);
		return path;
	}),

	hasOrigamiManifest: function(componentName) {
		return this.getOrigamiManifestPath(componentName).then(function(path) {
			return !!path;
		});
	},

	getConfig: function() {
		if (!this.options.dir) throw new Error('this.options.dir missing');

		return {
			cwd: this.options.dir,
			timeout: 10000,
			offline: false,
			'strict-ssl': true,
			color: false,
			interactive: false,
			registry: {
				search: [
					this.registry.registryURL,
					'https://registry.bower.io',
				],
			},
			'storage': {
				packages: path.join(this.options.sharedDir || this.options.dir, 'bower_packages_cache'),
				registry: path.join(this.options.sharedDir || this.options.dir, 'bower_registry_cache'),
				links: path.join(this.options.dir, 'bower_links'),
				empty: path.join(this.options.sharedDir || this.options.dir, 'bower_empty'),
				completion: path.join(this.options.sharedDir || this.options.dir, 'bower_completion'),
			},
		};
	},

	/**
	 * Hide paths in the message, replace internal errors with user-friendlier versions
	 */
	rethrowSanitizedError: function(err){
		throw this.sanitizeError(err);
	},

	sanitizeError: function(err) {
		// git auth fails when a component has a hardcoded broken git URL for a dependency
		if (err.code === 'ECMDERR' && /ls-remote/.test(err.message) && err.exitCode === 128 && err.details && err.data && err.data.endpoint) {
			const details = err.details.replace(/\s+$/,'');
			let code = 'EREMOTEIO';

			// If the git URL is broken because it is not found respond with
			// an ENOTFOUND error code
			if (details.includes('not found')) {
				code = 'ENOTFOUND';
			}

			err.details = err.message;
			err.message = 'Unable to fetch \'' + err.data.endpoint.name + '\' from \'' + err.data.endpoint.source + '\', because: ' + details;
			err.code = code;
		}
		if (err.code === 'EINVRES') {
			err.code = 'EREMOTEIO';
		}
		if (err.code === 'ENAMETOOLONG') {
			err.message = 'Package ' + err.data.endpoint.source + ' not found';
			err.code = 'ENOTFOUND';
		}
		if (this.options) {
			err.message = err.message.split(this.options.dir).join('.');
		}
		return err;
	}
};

module.exports = ModuleInstallation;
