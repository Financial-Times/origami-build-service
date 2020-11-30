'use strict';

const sass = require('@financial-times/sass');
const path = require('path');
const execa = require('execa');
const fs = require('fs').promises;

/**
 * Creates a bundle using dart-sass and the index.scss file located within `location` as the entrypoint of the bundle.
 *
 * @param {String} location The path where the index.scss resides within.
 * @returns {Promise<String>} The bundled Sass as a string
 */
async function bundleSass(location) {
    // Build Sass
    await execa.sync(sass, [
        '--no-source-map',
        `--load-path=${path.join(location, 'node_modules')}`,
        '--style=compressed',
        '--update',
        '--no-source-map',
        'index.scss',
        'output.css'
    ], {
        cwd: location
    });

    return await fs.readFile(path.join(location,'output.css'), 'utf-8');
}

module.exports = {
	bundleSass,
};
