'use strict';

const Q = require('q');
const fs = require('fs');
const path = require('path');
const CompileError = require('./utils/compileerror');
const toShrinkwrapUrl = require('./shrinkwrap').toUrl;
const uniqueid = require('./utils/uniqueid');

const streamCat = require('streamcat');
const log = require('./utils/log');

const gulp = require('gulp');
const obt = require('origami-build-tools');

function JsBundler() {}

JsBundler.prototype = {

	createShrinkWrapComment: function(installation, moduleset) {
		return Promise.all([
			installation.listAll(),
			installation.getInstalledInModuleset(moduleset)
		]).then(function(results) {
			const allOrigamiComponents = results[0];
			const requestedComponents = results[1];

			return new Buffer('/** Shrinkwrap URL:\n *      ' + (toShrinkwrapUrl('js', requestedComponents, allOrigamiComponents, 'v2')) + '\n */\n');
		});
	},

	createMainFile: function(installation, moduleset, mainScriptPath, options) {
		if (!installation || !installation.getBowerComponentsDir) throw new Error('Needs installation');

		options = options || {};

		// Creating file to include other components and define export variable in needed.
		// Each moduleset must have its own file (e.g. mainPathOverride can differ)
		const mainfd = fs.createWriteStream(mainScriptPath);

		const allComponentsPromise = installation.listAll();

		// This call caches the list of origami components, we're not interested
		// in the return value
		installation.listAllOrigamiComponents();
		const requestedComponentsPromise = installation.getInstalledInModuleset(moduleset);

		const sourcePromise = Promise.all([requestedComponentsPromise, allComponentsPromise]).then(function(results) {

			const requestedComponents = results[0];
			const allComponents = results[1];

			const moduleVersions = {};
			const requires = [];

			for(let name in requestedComponents) {
				if (requestedComponents.hasOwnProperty(name)) {
					const comp = requestedComponents[name];
					for(let i in comp.paths) {
						if (comp.paths.hasOwnProperty(i)) {
							const override = /\.js$/.test(comp.mainPathOverride);
							if (override || /\.js$/.test(comp.paths[i])) {
								if (comp.version) {
									moduleVersions[name] = comp.version;
								}
								const req = 'require('+JSON.stringify(override ? installation.getPathToComponentsFile(name, comp.mainPathOverride) : name)+')';
								requires.push(options.exportName ? (JSON.stringify(name)+':'+req) : (req+';'));
								break;
							}
						}
					}
				}
			}

			const assetsSource = ('o-assets' in allComponents) ? 'require(\'o-assets\').setGlobalPathPrefix(\'//build.origami.ft.com/files/\').setModuleVersions(' + JSON.stringify(moduleVersions) + ');' : '';

			// if exportName is defined generate window["exportName"] = {}, otherwise just rows of require();
			const importsSource = options.exportName ? 'window['+JSON.stringify(options.exportName)+'] = {' + requires.join(',\n') + '}' : requires.join('\n');

			return assetsSource + ';require(\'./bower.json\');' + importsSource;
		}); // TODO: rethrowSanitizedError should be more generic, not a method on installation.


		const writeDonePromise = Q.waitStreamFinish(mainfd);

		return sourcePromise.then(function(source) {
			mainfd.end(source);
			return writeDonePromise.then(function() {
				return mainScriptPath;
			});
		});

	},

	/**
	 * Returns promise for buffer with concatenated minified JS bundle.
	 *
	 * @return Promise
	 */
	getContent: Q.async(function*(installation, moduleset, options) {
		const opts = options || {};

		const uniqueIdentifier =
			moduleset.getIdentifier() +
			moduleset.getMainPathOverridesIdentifier() + '.' +
			((typeof opts.exportName) === 'string' ? uniqueid(opts.exportName, 64) : 'noexportname');

		const relativeMainScriptPath = 'main-' + uniqueIdentifier + '.js';
		const mainScriptPath = path.join(installation.getDirectory(), relativeMainScriptPath);

		const buildOutputPath = installation.getDirectory();
		const buildOutputName = 'build-' + moduleset.getMainPathOverridesIdentifier() + '.js';

		const mainFilePromise = this.createMainFile(installation, moduleset, mainScriptPath, opts);
		const skrinkWrapBufferPromise = this.createShrinkWrapComment(installation, moduleset);
		const jsBundlePromise = this._doBuild(installation, mainFilePromise, relativeMainScriptPath, path.join(buildOutputPath, '/build'), buildOutputName, opts);

		// Concatenate buffers and streams in order asynchronously, returns a
		// ReadStream with the concatenated content
		return streamCat([
			skrinkWrapBufferPromise,
			jsBundlePromise
		], {
			errorMapper: function(error) {
				return installation.sanitizeError(error);
			}
		});
	}),

	_doBuild: Q.async(function*(installation, mainFilePromise, mainFile, outputPath, outputFileName, options) {
		yield mainFilePromise;

		return new Promise(function(resolve, reject) {
			const config = {
				js: path.join(installation.getDirectory(), mainFile),
				buildFolder: outputPath,
				buildJs: outputFileName,
				env: options.minify ? 'production' : 'development',
				cwd: installation.getDirectory(),
				basedir: installation.getDirectory(),
				sourcemaps: options.minify ? false : 'inline'
			};
			log.trace(config, 'Starting OBT JS build');
			const buildStream = obt.build.js(gulp, config);

			const filesGenerated = [];

			buildStream.on('data', function(file) {
				log.trace('OBT JS building');
				filesGenerated.push(file);
			});

			buildStream.on('end', function() {
				if (filesGenerated.length > 0) {
					log.debug(config, 'OBT JS build complete');
					resolve(filesGenerated[0].contents);
				} else {
					reject(new Error('No file were generated running obt.build.js'));
				}
			});

			buildStream.on('error', function(err) {
				reject(new CompileError(err.message));
			});
		});
	})
};

module.exports = JsBundler;
