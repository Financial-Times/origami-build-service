'use strict';

const sass = require('@financial-times/sass');
const path = require('path');
const execa = require('execa');
const fs = require('fs').promises;
const ComponentError = require('../../../lib/utils/componentError');

/**
 * Creates a bundle using dart-sass
 *
 * @param {String} location The path where the index.scss resides within.
 * @param {String} entryPointPath The path to the entrypoint sass file.
 * @param {Array<String>} [loadPaths=[]] Paths to use when resolving imports.
 * @returns {Promise<String>} The bundled Sass as a string
 */
async function bundleSass(location, entryPointPath, loadPaths=[]) {
	loadPaths = loadPaths.map(loadPath => {
		return `--load-path=${path.join(location, loadPath)}`;
	});

	try {
		await execa.sync(sass, loadPaths.concat([
			`--load-path=${path.join(location, 'node_modules')}`,
			'--no-source-map',
			'--style=compressed',
			'--update',
			entryPointPath,
			'output.css'
		]), {
			cwd: location
		});
	} catch (error) {
		throw new ComponentError(error.stderr);
	}

	return await fs.readFile(path.join(location, 'output.css'), 'utf-8');
}

module.exports = {
	bundleSass,
};
