'use strict';

const spawn = require('child_process').spawn;
const Q = require('./utils/q');
const csspreprocess = require('./csspreprocess');
const pfs = require('q-io/fs');
const CompileError = require('./utils/compileerror');
const semver = require('semver');
const toShrinkwrapUrl = require('./shrinkwrap').toUrl;
const streamCat = require('streamcat');
const log = require('./utils/log');

function sass_escape_string(str) {
	if (str === null || typeof str === 'boolean') return JSON.stringify(str);
	return '\''+str.replace(/\\/g,'\\\\').replace(/'/g,'\\\'')+'\'';
}

function CssBundler() {}

function isSassPath(path){
	return path && (/\.(?:sass|scss)$/).test(path);
}

function isCssPath(path) {
	return path && /\.css$/.test(path);
}

CssBundler.prototype = {

	/**
	 * Returns bundle for concatenated, compiled & minified Sass/CSS
	 *
	 * options.minify === "none" disables minification (on by default).
	 */
	getContent: Q.async(function*(installation, moduleset, options){
		const bundler = this;
		options = options || {};
		let shouldMinify = options.minify;
		const compileOptions = { minify: shouldMinify };

		const allComponentsPromise = installation.listAll();
		const allOrigamiComponentsPromise = installation.listAllOrigamiComponents();
		const requestedComponentsPromise = installation.getInstalledInModuleset(moduleset);
		const bowerComponentsDir = installation.getBowerComponentsDir();


		// Generate the shrinkwrap comment
		const shrinkwrapCommentPromise = Promise.all([
			allOrigamiComponentsPromise,
			requestedComponentsPromise
		]).then(function(results) {
			const allOrigamiComponents = results[0];
			const requestedComponents = results[1];
			return toShrinkwrapUrl('css', requestedComponents, allOrigamiComponents, 'v1');
		}).then(function(shrinkwrapUrl) {
			return new Buffer('/** Shrinkwrap URL:\n *    ' + shrinkwrapUrl + '\n */\n');
		});

		// Generate the unprefixed CSS.
		const cssBufferPromise = requestedComponentsPromise.then(function(requestedComponents) {

			// Sass ignores @import .css, so CSS files are concatenated separately.
			const readPromises = bundler._readCssFiles(installation, requestedComponents);

			return allComponentsPromise.then(function(allComponents) {
				readPromises.push(bundler._compileSassFiles(
						installation,
						requestedComponents,
						allComponents,
						bowerComponentsDir,
						compileOptions));

				return Promise.all(readPromises).then(function(unprefixedCss) {
					return Buffer.concat(unprefixedCss).toString();
				}).then(function(unprefixedCss) {
					return csspreprocess.autoprefixer(unprefixedCss).catch(function(e) {
						// HACK: If failed, turn of minification
						shouldMinify = false;
						return '/* error: ' + e.message + '*/\n\n' + unprefixedCss;
					});
				}).then(function(prefixedCss) {
					if (shouldMinify) {
						return csspreprocess.minify(prefixedCss).then(function(minifiedCss) {
							return new Buffer(minifiedCss);
						});
					}

					return new Buffer(prefixedCss);
				});
			});

		}.bind(this));

		return streamCat([shrinkwrapCommentPromise, cssBufferPromise], {
			errorMapper: function(error) {
				return installation.sanitizeError(error);
			}
		});
	}),

	_readCssFiles: function(installation, requestedComponents) {
		const readpromises = [];

		for(let name in requestedComponents) {
			if (requestedComponents.hasOwnProperty(name)) {
				const comp = requestedComponents[name];
				let paths;
				if (isCssPath(comp.mainPathOverride)) {
					paths = [installation.getPathToComponentsFile(name, comp.mainPathOverride)];
				} else {
					// if mainPathOverride is Sass, still include all CSS, since Sass can't.
					paths = comp.paths.filter(isCssPath);
				}
				for(let i in paths) {
					if (paths.hasOwnProperty(i)) {
						readpromises.push(pfs.read(paths[i], {flags: 'b'}));
					}
				}
			}
		}

		return readpromises;
	},

	_compileSassFiles: function(installation, requestedComponents, allComponents, bowerComponentsDir, options) {
		const variables = {};
		const opts = options || { minify: false };

		const imports = [];
		const assetsPaths = {};

		let oAssetsPresent;
		if (allComponents['o-assets']){
			variables['o-assets-global-path'] = '//build.origami.ft.com/files/';
			oAssetsPresent = true;
		}

		for(let name in allComponents) {
			if (allComponents.hasOwnProperty(name)) {
				const comp = requestedComponents[name] || allComponents[name];
				const isRequested = name in requestedComponents;

				let paths;
				if (isSassPath(comp.mainPathOverride)) {
					paths = [installation.getPathToComponentsFile(name, comp.mainPathOverride)];
				} else if (isCssPath(comp.mainPathOverride)) {
					continue; // if CSS is the main file, it's already been included in _readCssFiles
				} else {
					paths = comp.paths.filter(isSassPath);
					if (!paths.length) continue;
				}

				const componentName = comp.variablePrefixName || name;
				// Adds necesarry sass variables and mixin so both the new and old implementation of oAssets is taken into account
				if (oAssetsPresent) {
					const componentVersion = comp.version || '*';
					// Variables for legacy implementation of oAssets
					variables[componentName+'-version'] = componentVersion;
					variables[componentName+'-assets-path'] = componentName;

					// Add each component into the o-assets paths map with a custom path to the asset, make the version easily accessible so we can compare
					// it with other asset paths if a conflict occurs
					const assetPathInfo = {
						path: '"' + variables['o-assets-global-path'] + componentName + '@' + componentVersion + '"',
						version: componentVersion
					};

					// If the component already exists in the asset map, choose
					// the highest version available
					if (componentName in assetsPaths) {
						if (semver.gt(componentVersion, assetsPaths[componentName].version)) {
							assetsPaths[componentName] = assetPathInfo;
						}
					} else {
						assetsPaths[componentName] = assetPathInfo;
					}
				}
				// bundle/css?modules=o-assets@1,http://bla.com/o-assets.tar.gz
				variables[componentName+'-is-silent'] = !isRequested; // make all components silent unless explicitly requested

				if (isRequested) {
					for(let i in paths) {
						if (paths.hasOwnProperty(i)) {
							imports.push('@import ' + JSON.stringify(paths[i]) + ';\n');
						}
					}
				}
			}
		}

		if (oAssetsPresent) {
			variables['o-assets-paths-map'] = '(';
			for (let assetPath in assetsPaths) {
				if (assetsPaths.hasOwnProperty(assetPath)) {
					// We don't need to worry about the map ending in the comma, it won't make sass fail
					variables['o-assets-paths-map'] += assetPath + ': ' + assetsPaths[assetPath].path + ',';
				}
			}

			variables['o-assets-paths-map'] += ')';
		}

		// Components are allowed to import any file from any other component,
		// even those which are not their explicit dependencies.
		// This is because the buildservice doesn't install devDependencies,
		// but demos may require them (and request them explicitly to work around lack of devDependencies)

		return this._runSassCompiler(variables, imports, bowerComponentsDir, opts);
	},

	_runSassCompiler: function(variables, imports, bowerComponentsDir, options) {
		const def = Q.defer();

		if (!imports.length) {
			log.debug('No Sass files');

			def.resolve(new Buffer(0));
			return def.promise;
		}

		log.trace({variables:variables, imports:imports}, 'Starting Sass compilation');

		const args = ['--stdin','--scss','--load-path','.','--no-cache', '-E', 'UTF-8'];

		if (options.minify) {
			args.push('--quiet');
		}

		const sassproc = spawn('sass', args, {cwd:bowerComponentsDir});
		const buffers = [];
		const errors = [];

		sassproc.stdout.on('error', def.reject);
		sassproc.stdin.on('error', def.reject);
		sassproc.on('error', def.reject);

		sassproc.stderr.on('data', function(data){
			const err = data.toString()
				.replace(/^\s*Use --trace for backtrace\.\n?/m, '')
				.replace(/.*Insecure world writable dir.*/, '')
				.replace(/^\s*Load path:[^\n]*\n?/m, '');
			if (/\S/.test(err)) {
				log.warn(err);
				errors.push(err.split(bowerComponentsDir).join('.').replace(/(?:on|from) line \d+ of (?:an unknown file|standard input)\n?/, '')); // hide noise from users
			}
		}.bind(this));

		sassproc.stdout.on('data', function(data){
			buffers.push(data);
		});

		let tmp = '';
		if (variables) {
			for(let name in variables) {
				if (variables.hasOwnProperty(name)) {
					let sassVariable = variables[name];
					// Sass maps don't need to be escaped
					if (sassVariable.toString().indexOf('(') !== 0) {
						sassVariable = sass_escape_string(sassVariable);
					}
					tmp += '$' + name + ':' + sassVariable + ';';
				}
			}
		}
		tmp += imports.join('\n');
		sassproc.stdin.end(tmp);

		// using close rather than exit event to wait for stdout/stderr
		sassproc.on('close', function(code, signal) {

			// AB: Would be good to be able to log the bundle identifier
			log.debug({exitCode:code, signal:signal}, 'Sass compilation finished');
			if (code) {
				return def.reject(new CompileError(errors.join('\n')));
			} else {
				if (errors.length) {
					// Append warnings in a comment that won't be removed by minification
					buffers.unshift(new Buffer('\n/*! '+errors.join('\n').replace(/\*\//g,'* /')+' */'));
				}
				def.resolve(Buffer.concat(buffers));
			}
		}.bind(this));

		return def.promise;
	},
};

module.exports = CssBundler;
