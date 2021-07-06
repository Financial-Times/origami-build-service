'use strict';

const path = require('path');
const fs = require('fs').promises;
const fileExists = require('fs').existsSync;
const mergeDeep = require('merge-deep');
const globby = require('globby');
const mustache = require('mustache');
const ComponentError = require('../../../lib/utils/componentError');
const { bundleJavascript } = require('./bundleJavascript');
const { bundleSass } = require('./bundleSass');
const { getOrigamiJson } = require('../../utils/getOrigamiJson');
const { readIfExists } = require('../../utils/readIfExists');

/**
 * DemoDefaultsConfig -- https://origami.ft.com/spec/v1/manifest/#demosdefaults
 * @typedef {Object} DemoDefaultsConfig
 * @property {String} [template] Describes the path to the mustache template to render
 * @property {String} [sass] Describes the path to the Sass file to compile
 * @property {String} [js] Describes the JS file to build
 * @property {Object|String} [data] Describes data to populate to the mustache template with. If this is a string it must be a path to a JSON file containing the data, relative to the root of the repo
 * @property {String} [documentClasses] Names CSS classes to set on the html tag.
 * @property {Array<String>} [dependencies] Is a list of other components that are only needed for demos
 */

/**
 * DemoConfig -- https://origami.ft.com/spec/v1/manifest/#demos
 * @typedef {Object} DemoConfig
 * @property {String} name Demo name which will be used as the name of the outputted html file
 * @property {String} title A title for the demo which will appear when listed in the Registry
 * @property {String} description An explanation of the purpose of the demo
 * @property {String} template Describes the path to the demo-specific mustache template to render
 * @property {String} [sass] Describes the path to the demo-specific Sass file to compile
 * @property {String} [js] Describes the path to the demo-specific JS file to build
 * @property {Object|String} [data] Describes data to populate to the component-specific mustache template with. If this is a string it must be a path to a JSON file containing the data, relative to the root of the repo.
 * @property {Array<String>} [brands] For components which support brands, this describes one or more brands which the demo applies to (“master”, “internal, “whitelabel”)
 * @property {String} [documentClasses] Names CSS classes to set on the html tag.
 * @property {Array<String>} [dependencies] Is a list of other components that are only needed for demos
 * @property {Boolean} [hidden] Whether the demo should be hidden in the Registry
 * @property {Boolean} [display_html=true] Whether the demo should have a HTML tab in the Registry (defaults to true)
 */

/**
 * BuildConfig
 * @typedef {Object} BuildConfig
 * @property {DemoConfig} demo The configuration for the demo.
 * @property {String} brand The brand to build the demo for.
 * @property {String} cwd The path where the installed component resides within.


 */



module.exports = {
	/**
	 * Builds a specific demo for a specific brand.
	 *
	 * @param {String} location The path where the installed component resides within.
	 * @param {String} brand The brand to build the demo for.
	 * @param {String} demoName The name of the demo to build.
	 * @param {String} componentName The name of the component.
	 * @param {String} version The version of the component.
	 * @returns {Promise<String>} The built demo's HTML.
	 */
	buildDemo: async function buildDemo(location, brand, demoName, componentName, version) {
		const origamiComponentConfiguration = await getOrigamiJson(location);
		if (!origamiComponentConfiguration) {
			throw new ComponentError(`${componentName}@${version} does not have an origami.json file. An origami.json file is required to know how to build the component. See the component specification for more details: https://origami.ft.com/spec/`);
		}

		const demos = await getComponentDemos(origamiComponentConfiguration);

		if (demos.length === 0) {
			throw new ComponentError(`${componentName}@${version} has no demos defined within it's origami.json file. See the component specification for details on how to configure demos for a component: https://origami.ft.com/spec/`);
		}

		if (!hasUniqueNames(demos)) {
			throw new ComponentError(`${componentName}@${version} has multiple demos with the same name, this is not supported.`);
		}

		/**
		 * @type DemoConfig|undefined
		 */
		const demoConfig = demos.find(demoConfig => demoConfig.name === demoName);

		if (!demoConfig) {
			throw new ComponentError(`${componentName}@${version} has no demo with the requested name: ${demoName}`);
		}

		/**
		 * @type DemoDefaultsConfig
		 */
		const demoDefaultConfiguration = await getComponentDefaultDemoConfig(location);
		/**
		 * @type DemoConfig
		 */
		const demoBuildConfig = mergeDeep(
			{
				documentClasses: '',
				description: '',
			},
			demoDefaultConfiguration,
			demoConfig
		);

		/**
		 * @type BuildConfig
		 */
		const buildConfig = {
			demo: demoBuildConfig,
			brand: brand,
			cwd: location,
		};

		let css;
		if (demoBuildConfig.sass) {
			try {
				css = await buildDemoSass(buildConfig);
			} catch (error) {
				throw new ComponentError(`${componentName}@${version}'s demo named "${demoName}" could not be built due to a compilation error within the Sass: ` + error.message);
			}
		}

		let js;
		if (demoBuildConfig.js) {
			try {
				js = await buildDemoJs(buildConfig);
			} catch (error) {
				throw new ComponentError(`${componentName}@${version}'s demo named "${demoName}" could not be built due to a compilation error within the JavaScript: ` + error.message);
			}
		}

		try {
			return await buildDemoHtml(buildConfig, css, js, componentName);
		} catch (error) {
			throw new ComponentError(`${componentName}@${version}'s demo named "${demoName}" could not be built due to a compilation error within the Mustache templates: ` + error.message);
		}
	}
};


/**
 * @param {String} sassFile - The file to return Sass from.
 * @param {Object} config - Configuration to augment Sass.
 * @param {String|Undefined} config.brand [undefined] - The brand the Sass is for .e.g. "master", "internal", or "whitelabel".
 * @return {Promise<String>} - The sass from the file, with extra Sass variables and prefixes according to configuration.
 */
async function getSassData(sassFile, config = {
	brand: undefined
}) {
	const code = await fs.readFile(sassFile, 'utf-8');

	// Set Sass system code variable `$system-code`.
	const sassSystemCodeVariable = '$system-code: "origami-build-service";';
	// Set Sass brand variable `$o-brand`, given as an obt argument.
	const sassBrandVariable = config.brand ? `$o-brand: ${config.brand};` : '';

	return sassSystemCodeVariable + sassBrandVariable + code;
}


/**
 * @param {BuildConfig} buildConfig
 * @return {Promise<String>} The css for the specified demo.
 */
async function buildDemoSass(buildConfig) {
	const src = path.join(buildConfig.cwd, '/' + buildConfig.demo.sass);

	const exists = fileExists(src);
	if (!exists) {
		throw new ComponentError(`Sass file not found:  ${src}`);
	}

	const sassData = await getSassData(src, {
		brand: buildConfig.brand
	});

	await fs.writeFile(src, sassData, 'utf-8');

	return await bundleSass(buildConfig.cwd, src, [
		'demos/src',
		'demos/src/scss'
	]);
}

/**
 * @param {BuildConfig} buildConfig
 * * @return {Promise<String>} The js for the specified demo.
 */
async function buildDemoJs(buildConfig) {
	const src = path.join(buildConfig.cwd, '/' + buildConfig.demo.js);
	const exists = fileExists(src);
	if (!exists) {
		throw new ComponentError('JavaScript file not found: ' + src);
	}

	return await bundleJavascript(src);
}

/**
 * Get shared demo configuration.
 * @param {string} cwd - The component's directory (the current working directory).
 * @return {Promise<object>} - An object of configuration.
 */
async function getComponentDefaultDemoConfig(cwd) {
	const origamiJson = await getOrigamiJson(cwd);
	if (
		origamiJson &&
		origamiJson.demosDefaults &&
		typeof origamiJson.demosDefaults === 'object'
	) {
		return origamiJson.demosDefaults;
	}
	return {};
}

async function getComponentDemos(config) {
	if (config && config.demos && Array.isArray(config.demos)) {
		return config.demos;
	}
	return [];
}

function hasUniqueNames(demos) {
	const names = {};
	for (let i = 0; i < demos.length; i++) {
		if (names[demos[i].name]) {
			return false;
		}
		names[demos[i].name] = true;
	}
	return true;
}

async function loadLocalDemoData(dataPath) {
	const file = await readIfExists(dataPath);
	if (file) {
		try {
			const fileData = JSON.parse(file);
			if (typeof fileData === 'object') {
				return fileData;
			} else {
				return {};
			}
		} catch (error) {
			throw new ComponentError(`${dataPath} is not valid JSON.`);
		}
	} else {
		throw new ComponentError(`Demo data not found: ${dataPath}`);
	}
}

function loadDemoData(buildConfig) {
	if (typeof buildConfig.demo.data === 'string') {
		const dataPath = path.join(buildConfig.cwd, '/' + buildConfig.demo.data);
		return loadLocalDemoData(dataPath);
	} else if (typeof buildConfig.demo.data === 'object') {
		return Promise.resolve(buildConfig.demo.data);
	} else {
		return Promise.resolve({});
	}
}

async function buildDemoHtml(buildConfig, css, js, componentName) {
	const src = path.join(buildConfig.cwd, '/' + buildConfig.demo.template);
	const partialsDir = path.dirname(src);
	const configuredPartials = {};

	const data = await loadDemoData(buildConfig);
	const exists = fileExists(src);
	if (!exists) {
		throw new ComponentError(`Demo template not found: ${src}`);
	}

	const oDemoTpl = await fs.readFile(src, { encoding: 'utf8' });
	const dependencies = buildConfig.demo.dependencies;
	const brand = buildConfig.brand;
	data.oDemoTitle = componentName + ': ' + buildConfig.demo.name + ' demo';
	data.oDemoDocumentClasses = buildConfig.demo.documentClasses || buildConfig.demo.bodyClasses;

	data.oDemoComponentStyle = css || '';
	data.oDemoComponentScript = js ? js.replace('</script>', '<\\/script>') : '';

	data.oDemoDependenciesStylePath = dependencies ?
		`https://www.ft.com/__origami/service/build/v3/bundles/css?system_code=origami&components=${dependencies.toString()}&brand=${brand || 'master'}` :
		'';

	data.oDemoDependenciesScriptPath = dependencies ?
		'https://www.ft.com/__origami/service/build/v3/bundles/js?system_code=origami&components=' + dependencies.toString() :
		'';

	configuredPartials.oDemoTpl = String(oDemoTpl);

	const polyfillUrl = await constructPolyfillUrl(buildConfig.cwd);
	data.oDemoPolyfillUrl = polyfillUrl;
	const partials = await loadPartials(partialsDir);
	const template = await fs.readFile(path.join(__dirname, '/../../templates/page.mustache'), 'utf-8');
	return mustache.render(template, data, Object.assign(configuredPartials, partials));
}
// List mustache files in a directory, recursing over subdirectories
async function getMustacheFilesList(basePath) {
	const opts = {
		useGitIgnore: true,
		usePackageJson: false,
		cwd: basePath
	};

	const files = await globby(['**/**.mustache'], opts);
	return files.map(file => path.join(basePath, file));
}

/**
 * Collect all the mustache partials from within a directory and it's subdirectories into an object
 * @param {String} partialsDir The directory to search within for mustache partials
 * @returns {Promise<Object>} A Promise which resolves to an object where the property names are the names of the partials and the values are the partials as Strings
 */
async function loadPartials(partialsDir) {
	const partials = {};

	// Get a list of all mustache files in a directory
	const filePaths = await getMustacheFilesList(partialsDir);
	for (const filePath of filePaths) {
		// Calculate the partial name, which is what is used
		// to refer to it in a template. We remove the base directory,
		// replace any preceeding slashes, and remove the extension.
		const partialName = filePath.replace(partialsDir, '').replace(/^\//, '').replace(/\.mustache$/i, '');

		const partial = await fs.readFile(filePath, {
			encoding: 'utf8'
		});
		partials[partialName] = partial;
	}

	return partials;
}

async function collectAllOrigamiConfigs(basePath) {
	const opts = {
		useGitIgnore: false,
		usePackageJson: false,
		cwd: basePath
	};

	const configPaths = await globby(['node_modules/*/*/origami.json', 'node_modules/*/origami.json', 'origami.json'], opts);

	return Promise.all(configPaths.map(async configPath => {
		const config = JSON.parse(await fs.readFile(path.join(basePath, configPath), 'utf-8'));
		return config;
	}));

}

async function constructPolyfillUrl(basePath) {
	const componentConfigs = await collectAllOrigamiConfigs(basePath);
	// We include the `CustomEvent` polyfill so that demos which include dev
	// dependencies work in older browsers. This is because the Origami Build
	// Service includes `o-autoinit` which requires the `CustomElement` polyfill.
	// https://github.com/Financial-Times/origami-build-tools/issues/906
	const requiredFeatures = ['CustomEvent'];
	for (const config of componentConfigs) {
		if (config.browserFeatures && config.browserFeatures.required) {
			requiredFeatures.push(...config.browserFeatures.required);
		}
	}

	// Remove duplicated features from the array
	const features = Array.from(new Set(requiredFeatures));
	return `https://polyfill.io/v3/polyfill.min.js?features=${features.join(',')}&flags=gated&unknown=polyfill`;
}
