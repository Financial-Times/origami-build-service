'use strict';

const Q = require('./utils/q');
const fs = require('fs');
const pfs = require('fs-extra-p');
const semver = require('semver');
const toShrinkwrapUrl = require('./shrinkwrap').toUrl;
const CompileError = require('./utils/compileerror');
const streamCat = require('streamcat');
const hostnames = require('./utils/hostnames');
const raven = require('raven');

const gulp = require('gulp');
const obt = require('origami-build-tools');
const path = require('path');

function sass_escape_string(str) {
	if (str === null || typeof str === 'boolean') return JSON.stringify(str);
	return '\'' + str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'') + '\'';
}

function CssBundler(options) {
	this.options = options || {};
	this.log = this.options.log;
}

function isSassPath(path) {
	return path && (/\.(?:sass|scss)$/).test(path);
}

function isCssPath(path) {
	return path && /\.css$/.test(path);
}

CssBundler.prototype = {

	createShrinkWrapComment: function(installation, moduleset, options) {
		return Promise.all([
			installation.listAll(),
			installation.getInstalledInModuleset(moduleset)
		]).then(function(results) {
			const allOrigamiComponents = results[0];
			const requestedComponents = results[1];
			return toShrinkwrapUrl('css', requestedComponents, allOrigamiComponents, 'v2', options);
		}).then(function(shrinkwrapUrl) {
			return new Buffer('/** Shrinkwrap URL:\n *    ' + shrinkwrapUrl + '\n */\n');
		});
	},

	createMainFile: Q.async(function* (installation, moduleset, brand, mainScriptPath, options) {
		if (!installation || !installation.getBowerComponentsDir) throw new Error('Needs installation');

		const opts = options || {};

		// Each moduleset must have its own file (e.g. mainPathOverride can differ)
		const mainfd = fs.createWriteStream(mainScriptPath);

		// This call caches the list of origami components, we're not interested
		// in the return value
		installation.listAllOrigamiComponents();
		const allComponents = yield installation.listAll();
		const requestedComponents = yield installation.getInstalledInModuleset(moduleset);

		const mainSassDescription = yield this._compileSassFiles(installation, requestedComponents, allComponents, brand, opts);

		const sassVariables = [];
		for (const name in mainSassDescription.variables) {
			if (mainSassDescription.variables.hasOwnProperty(name)) {
				const unescapedVariable = mainSassDescription.variables[name];
				// Sass maps don't need to be escaped
				const isSassMap = unescapedVariable.toString().indexOf('(') === 0;
				const sassVariable = isSassMap ? unescapedVariable : sass_escape_string(unescapedVariable);
				sassVariables.push('$' + name + ':' + sassVariable + ';');
			}
		}

		const mainSassFileContents = sassVariables.concat(mainSassDescription.imports).join('\n');
		const writeDonePromise = Q.waitStreamFinish(mainfd);

		mainfd.end(mainSassFileContents);

		yield writeDonePromise;

		return mainScriptPath;
	}),

	/**
	 * Returns bundle for concatenated, compiled & minified Sass/CSS
	 *
	 * options.minify === "none" disables minification (on by default).
	 */
	getContent: Q.async(function* (installation, moduleset, brand, options) {
		const opts = options || {};
		const relativeMainSassPath = 'main-' + moduleset.getMainPathOverridesIdentifier() + '-' + brand + '.scss';
		const mainSassPath = path.join(installation.getDirectory(), relativeMainSassPath);

		const buildOutputPath = installation.getDirectory();
		const buildOutputName = 'build-' + moduleset.getMainPathOverridesIdentifier() + '-' + brand + '.js';

		const mainFilePromise = this.createMainFile(installation, moduleset, brand, mainSassPath, opts);
		const shrinkwrapPromise = this.createShrinkWrapComment(installation, moduleset, opts);
		const bundlePromise = this._doBuild(installation, mainFilePromise, path.join(buildOutputPath, '/build'), buildOutputName, opts);


		return streamCat([
			shrinkwrapPromise,
			bundlePromise
		], {
			errorMapper: function(error) {
				return installation.sanitizeError(error);
			}
		});
	}),

	_doBuild: Q.async(function*(installation, mainFilePromise, outputPath, outputFileName, options) {
		const log = this.log;
		const mainFile = yield mainFilePromise;

		return new Promise(function(resolve, reject) {

			const obtOptions = {
				sass: mainFile,
				buildCss: outputFileName,
				buildFolder: outputPath,
				env: options.minify ? 'production' : 'development',
				cwd: installation.getDirectory(),
				sourcemaps: options.minify ? false : 'inline'
			};

			log.trace(obtOptions, 'Starting OBT SASS build');

			const buildStream = obt.build.sass(gulp, obtOptions);
			const filesGenerated = [];

			buildStream.on('data', function(file) {
				filesGenerated.push(file);
			});

			buildStream.on('error', function(err) {
				reject(new CompileError(err.message));
			});

			buildStream.on('end', function() {
				if (filesGenerated.length > 0) {
					log.trace('OBT SASS build finished');
					resolve(filesGenerated[0].contents);
				} else {
					reject(new CompileError('No file were generated running obt.build.sass'));
				}
			});
		});
	}),

	_readCssFiles: function(installation, requestedComponents) {
		const readpromises = [];

		for (const name in requestedComponents) {
			if (requestedComponents.hasOwnProperty(name)) {
				const comp = requestedComponents[name];
				let paths;
				if (isCssPath(comp.mainPathOverride)) {
					paths = [installation.getPathToComponentsFile(name, comp.mainPathOverride)];
				} else {
					// if mainPathOverride is Sass, still include all CSS, since Sass can't.
					paths = comp.paths.filter(isCssPath);
				}
				for (const i in paths) {
					if (paths.hasOwnProperty(i)) {
						readpromises.push(pfs.readFile(paths[i]));
					}
				}
			}
		}

		return readpromises;
	},

	_compileSassFiles: Q.async(function* (installation, requestedComponents, allComponents, brand) {
		const variables = {};

		if (brand) {
			variables['o-brand'] = brand;
		}

		const imports = [];
		const assetsPaths = {};

		let oAssetsPresent;
		if (allComponents['o-assets']) {
			variables['o-assets-global-path'] = 'https://' + hostnames.preferred + '/v2/files/';
			oAssetsPresent = true;
		}

		for (const name in allComponents) {
			if (allComponents.hasOwnProperty(name)) {
				const comp = requestedComponents[name] || allComponents[name];
				const isRequested = name in requestedComponents;

				// Check the requested components support the requested brand.
				// Unbranded components are allowed to build for all brands.
				// As an exception, allow any build which includes o-layout < 3.0.0.
				// This is because o-layout < 3.0.0 mistakenly set the brand in its SCSS `$o-brand: internal`.
				// Therefore projects may have included it without setting their brand.
				let oLayoutBrandException = false;
				if (allComponents.hasOwnProperty('o-layout')) {
					oLayoutBrandException = parseFloat(allComponents['o-layout'].version) < 3;
				}
				if (isRequested && !oLayoutBrandException) {
					const manifest = yield installation.getOrigamiManifest(name);
					const isOrigami = Boolean(manifest);
					const supportsBrand = manifest && (!manifest.brands || manifest.brands.includes(brand));

					// TODO - Introduce an error if Raven does not capture anything.
					if (isOrigami && !supportsBrand) {
						const brands = manifest && manifest.brands ? manifest.brands : [];
						const msg = name + ' does not support the ' + brand + ' brand. Please set a supported brand ' + (brands.length > 1 ? '(one of: ' + brands.join(', ') + ') ' : '') + (brands.length === 1 ? '(' + brands[0] + ') ' : '') + 'using the "brand" query parameter, otherwise contact the Origami team to propose adding ' + brand + ' brand support to ' + name + '.';
						raven.captureException(new Error(msg), {
							extra: {
								brand,
								name,
								version: allComponents[name].version,
							},
							level: 'warning'
						});
					}
				}

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
					variables[componentName + '-version'] = componentVersion;
					variables[componentName + '-assets-path'] = componentName;

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
				variables[componentName + '-is-silent'] = !isRequested; // make all components silent unless explicitly requested

				if (isRequested) {
					for (const i in paths) {
						if (paths.hasOwnProperty(i)) {
							imports.push('@import ' + JSON.stringify(paths[i]) + ';\n');
						}
					}
				}
			}
		}

		if (oAssetsPresent) {
			variables['o-assets-paths-map'] = '(';
			for (const assetPath in assetsPaths) {
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
		return {
			variables: variables,
			imports: imports
		};
	}),
};

module.exports = CssBundler;
