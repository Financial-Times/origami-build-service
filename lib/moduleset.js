'use strict';

const querystring = require('querystring');
const URL = require('url');
const EndpointParser = require('bower-endpoint-parser');
const uniqueid = require('./utils/uniqueid');

/**
 * Describes a list of modules with their associated version.
 *
 * Terminology:
 *
 * Full module name can be a short name or URL, as defined in http://financial-times.github.io/ft-origami/docs/developer-guide/build-service/#get_bundlesjs
 * e.g. "o-colors@1.0" or "jquery" or "ftlabs/app" or "git@github.com:ftlabs/app.git@~v2.5"
 *
 * Module name is full module name without @version.
 *
 * Component name (endpoint.name) is an alphanumeric name distilled from the module name (it's package name or filename without extension, usually same as name in bower.json).
 *
 * full module name = module name [ "@" version ]
 * endpoint = [ component name "=" ] [ source URL or short name ] [ "#" version ]
 * version = semver
 */
function ModuleSet(fullModuleNames) {
	this._modules = fullModuleNames
		.filter(function(module) {
			return module && module !== '';
		})
		.map(ModuleSet.parseModuleName);
	this._id = false;
}

ModuleSet._fromArray = function(array) {
	const newModuleSet = new ModuleSet([]);
	newModuleSet._modules = array;
	return newModuleSet;
};

/**
 * Returns string that uniquely identifies this set of modules.
 * Distinct ModuleSet instances with same identifier are guaranteed to describe semantically same set of modules.
 *
 * It does not vary by main path overrides.
 *
 * @return string
 */
ModuleSet.prototype.getIdentifier = function() {
	if (!this._id) {
		const modules = this._modules.slice(0);

		modules.sort(function(a,b) {
			return a.fullModuleName > b.fullModuleName ? 1 : -1;
		});

		this._id = modules.map(function(module){
			return querystring.escape(module.moduleName) + '@' + querystring.escape(module.endpoint.target);
		}).join(';');
	}
	return uniqueid(this._id, 64);
};

/**
 * String that identifies combination of mainPathOverride settings.
 * It's not globally unique, only unique per set with the same getIdentifier() result (i.e. use both).
 *
 * @return {String}
 */
ModuleSet.prototype.getMainPathOverridesIdentifier = function() {
	const overrides = this.getResolvedModules().map(function(module){
		return module.mainPathOverride ? module.endpoint.name + ':' + module.mainPathOverride : undefined;
	}).sort();

	return uniqueid(overrides.join(';'), 64);
};

ModuleSet.prototype.getResolvedModules = function() {
	return this._modules;
};

/**
 * True if this moduleset has unambiguous versions, so it's unlikely to ever change.
 *
 * @return {Boolean}
 */
ModuleSet.prototype.hasExactVersionsOnly = function() {
	return this._modules.every(function(module){
		return /\..*\./.test(module.endpoint.target); // two dots assuming version 1.x.y
	});
};

ModuleSet.prototype.toFullModuleNames = function() {
	return this._modules.map(function(module){
		let moduleName = module.endpoint.source;
		if (module.endpoint.name !== moduleName) {
			moduleName = module.endpoint.name + '=' + moduleName;
		}
		if (moduleName.indexOf('@') > -1 || module.endpoint.target !== '*') {
			moduleName += '@' + module.endpoint.target;
		}
		if (module.mainPathOverride) {
			moduleName += ':' + module.mainPathOverride;
		}
		return moduleName;
	});
};

/**
 * Concatenate a ModuleSet to this ModuleSet, returning a new ModuleSet
 */
ModuleSet.prototype.concatenate = function(moduleSet) {
	return ModuleSet._fromArray(this.getResolvedModules().concat(moduleSet.getResolvedModules()));
};

/**
 * Converts module@version to Bower's endpoint with sanitised short name.
 *
 * @param  {String} fullModuleName
 * @return {Object} with {endpoint:{name:}}
 */
ModuleSet.parseModuleName = function(fullModuleName) {
	// name @version :/path (name may include @ and : for git@foo:bar URLs)
	const moduleNameParts = fullModuleName.match(/^(.*?)(?:@([^:]+))?(?::(\/[^\/\s@:][^\s@:]*))?$/);
	let moduleName = moduleNameParts[1];
	let version = moduleNameParts[2] || '*';
	let mainPathOverride = moduleNameParts[3];
	let endpoint = EndpointParser.decompose(moduleName + '#' + version);

	// this ensures component is installed under name expected by bundler even if bower.json doesn't conform to Origami spec and uses different name
	if (!endpoint.name) {
		endpoint.name = moduleNameToBowerCompatibleName(moduleName);
	}

	// if it's a filesystem path then it's useless for the buildservice, so replace it with something that _might_ work
	if (/^\.?\//.test(endpoint.source)) {
		moduleName = endpoint.name;
		fullModuleName = endpoint.name + '@' + endpoint.target;
	}

	return {
		fullModuleName: fullModuleName,
		moduleName: moduleName,
		endpoint: endpoint,
		endpointString: EndpointParser.compose(endpoint),
		mainPathOverride: mainPathOverride
	};
};

/**
 * Take module name (which may be a short name, URL or a git URL-ish) and transform it to
 * a simple human-readable stirng that's safe as a directory name.
 *
 * @param  {String} moduleName
 * @return {String}
 */
function moduleNameToBowerCompatibleName(moduleName) {
	if (/^[a-zA-Z0-9_-]+$/.test(moduleName)) return moduleName;

	const m = moduleName.match(/\/([a-zA-Z0-9_-]+)\.git$/); // git@host:foo.git are not real URLs
	if (m) {
		return m[1];
	}

	const url = URL.parse(moduleName, false, true);
	const name = querystring.unescape(url.pathname || url.href)
		.replace(/.*\//, '') 							  // take filename part
		.replace(/\.(?:git|(?:tar\.)?[bgx]z2?|zip)$/, '') // without extension
		.replace(/[^\w.-]/ig,'');                         // that's charset allowed by the bower-endpoint-parser

	if (!name) {
		throw new Error('Unable to parse module name: ' + moduleName);
	}

	return name;
}

module.exports = ModuleSet;
