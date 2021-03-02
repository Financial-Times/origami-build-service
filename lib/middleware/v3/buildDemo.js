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
const { JSONParseIfExists } = require('../../utils/JSONParseIfExists');
const { readIfExists } = require('../../utils/readIfExists');

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

		const demoConfig = demos.find(demoConfig => demoConfig.name === demoName);

		if (!demoConfig) {
			throw new ComponentError(`${componentName}@${version} has no demo with the requested name: ${demoName}`);
		}

		const demoDefaultConfiguration = await getComponentDefaultDemoConfig(location);
		const demoBuildConfig = mergeDeep(
			{
				documentClasses: '',
				description: '',
			},
			demoDefaultConfiguration,
			demoConfig
		);

		const buildConfig = {
			demo: demoBuildConfig,
			brand: brand,
			cwd: location,
		};

		let sass;
		if (demoBuildConfig.sass) {
			sass = await buildDemoSass(buildConfig, demoName, componentName, version);
		}

		let js;
		if (demoBuildConfig.js) {
			js = await buildDemoJs(buildConfig, demoName, componentName, version);
		}

		return await buildDemoHtml(buildConfig, sass, js, demoName, componentName, version);
	}
};


/**
 *
 * @param {String} sassFile - The file to return Sass from.
 * @param {Object} config - Configuration to augment Sass.
 * @param {String|Undefined} config.brand [undefined] - The brand the Sass is for .e.g. "master", "internal", or "whitelabel".
 * @param {String} config.sassPrefix [''] - Sass to prefix the Sass from file with.
 * @return {Promise<String>} - The sass from the file, with extra Sass variables and prefixes according to configuration.
 */
async function getSassData(sassFile, config = {
	brand: undefined,
	sassPrefix: ''
}) {
    const code = await fs.readFile(sassFile, 'utf-8');

	// Set Sass system code variable `$system-code`.
	const sassSystemCodeVariable = '$system-code: "origami-build-service";';
	// Set Sass brand variable `$o-brand`, given as an obt argument.
	const sassBrandVariable = config.brand ? `$o-brand: ${config.brand};` : '';

	return sassSystemCodeVariable + sassBrandVariable + code;
}

async function buildDemoSass(buildConfig, demoName, componentName, version) {
	const src = path.join(buildConfig.cwd, '/' + buildConfig.demo.sass);

	const exists = fileExists(src);
    if (!exists) {
        throw new ComponentError('Sass file not found: ' + src);
    }

    const sassData = await getSassData(src, {
        brand: buildConfig.brand,
        sassPrefix: buildConfig.sassPrefix,
    });

    await fs.writeFile(src, sassData, 'utf-8');

    try {
		return await bundleSass(buildConfig.cwd, src, [
			'demos/src',
			'demos/src/scss'
		]);
	} catch (error) {
		throw new ComponentError(`${componentName}@${version}'s demo named "${demoName}" could not be built due to a compilation error within the Sass: ` + error.message);
	}
}

async function buildDemoJs(buildConfig, demoName, componentName, version) {
	const src = path.join(buildConfig.cwd, '/' + buildConfig.demo.js);
	const exists = fileExists(src);
    if (!exists) {
        throw new ComponentError('JavaScript file not found: ' + src);
    }

    try {
		return await bundleJavascript(src);
	} catch (error) {
		throw new ComponentError(`${componentName}@${version}'s demo named "${demoName}" could not be built due to a compilation error within the JavaScript: ` + error.message);
	}
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

async function getComponentName(cwd) {
	const pkgJson = await getPackageJson(cwd);
	if (pkgJson) {
		const packageName = pkgJson.name;
		return packageName ? packageName.split('/').pop() : packageName;
	}
	return '';
}

function getPackageJson(cwd) {
	// eslint-disable-next-line new-cap
	return JSONParseIfExists(path.join(cwd, '/package.json'));
}

async function buildDemoHtml(buildConfig, css, js, demoName, componentName, version) {
	const src = path.join(buildConfig.cwd, '/' + buildConfig.demo.template);
	const partialsDir = path.dirname(src);
	const configuredPartials = {};

	const data = await loadDemoData(buildConfig);
	const exists = fileExists(src);
	if (!exists) {
		throw new ComponentError(`Demo template not found: ${src}`);
	}

	const [
		moduleName,
		oDemoTpl
	] = await Promise.all([
		getComponentName(buildConfig.cwd),
		fs.readFile(src, {
			encoding: 'utf8'
		})
	]);
	const dependencies = buildConfig.demo.dependencies;
	const brand = buildConfig.brand;
	data.oDemoTitle = moduleName + ': ' + buildConfig.demo.name + ' demo';
	data.oDemoDocumentClasses = buildConfig.demo.documentClasses || buildConfig.demo.bodyClasses;

	data.oDemoComponentStyle = css || '';
	data.oDemoComponentScript = js || '';

	data.oDemoDependenciesStylePath = dependencies ?
		`https://www.ft.com/__origami/service/build/v3/bundles/css?system_code=origami&modules=${dependencies.toString()}&brand=${brand || 'master'}` :
		'';

	data.oDemoDependenciesScriptPath = dependencies ?
		'https://www.ft.com/__origami/service/build/v3/bundles/js?system_code=origami&modules=' + dependencies.toString() :
		'';

	configuredPartials.oDemoTpl = String(oDemoTpl);

	try {
		const polyfillUrl = await constructPolyfillUrl(buildConfig.cwd);
		data.oDemoPolyfillUrl = polyfillUrl;
		const partials = await loadPartials(partialsDir);
		const template = await fs.readFile(path.join(__dirname, '/../../templates/page.mustache'), 'utf-8');
		return mustache.render(template, data, Object.assign(configuredPartials, partials));
	} catch (error) {
		throw new ComponentError(`${componentName}@${version}'s demo named "${demoName}" could not be built due to a compilation error within the Mustache templates: ` + error.message);
	}
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
