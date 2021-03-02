'use strict';

const execa = require('execa');

const appRoot = require('app-root-path');
const path = require('path');
const UserError = require('../../utils/usererror');

const npm = path.join(appRoot.toString(), './node_modules/.bin/npm');

/**
 * Installs the dependencies for the package.json file located at `location`
 *
 * @param {String} location Folder location to run `npm install` within.
 * @param {String} [registry] The npm Registry url to use when installing the dependencies
 * @returns {Promise<void>}
 */
async function installDependencies(location, registry = 'https://registry.npmjs.org/') {
	try {
		await execa(
			npm,
			[
				'install',
				'--production',
				'--ignore-scripts',
				'--no-package-lock',
				'--no-audit',
				'--prefer-offline',
				'--progress=false',
				'--fund=false',
				'--package-lock=false',
				'--strict-peer-deps',
				'--update-notifier=false',
				'--bin-links=false',
				`--registry=${registry}`
			],
			{
				cwd: location,
				preferLocal: true
			}
		);
	} catch (err) {
		if (err.stderr.includes('E404')) {
			const line = err.stderr.split('npm ERR!').find(line => line.includes('is not in the npm registry'));
			const pkg = line.match(/ 404  '([^']*)' is not in the npm registry/);
			throw new UserError(`${pkg[1]} is not in the npm registry`);
		} else if (err.stderr.includes('ETARGET')) {
			const line = err.stderr.split('npm ERR!').find(line => line.includes('No matching version found for'));
			const pkg = line.match(/No matching version found for '([^']*)'\./);
			throw new UserError(`${pkg[1]} is not in the npm registry`);
		} else {
			throw err;
		}

		// TODO: Catch invalid version error
		// TODO: Catch missing version error
	}
}

module.exports = {
	installDependencies,
};
