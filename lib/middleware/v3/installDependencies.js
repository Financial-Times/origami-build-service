'use strict';

const execa = require('execa');

const appRoot = require('app-root-path');
const path = require('path');

const npm = path.join(appRoot.toString(), './node_modules/.bin/npm');

/**
 * Installs the dependencies for the package.json file located at `location`
 *
 * @param {String} location
 * @returns {Promise<void>}
 */
async function installDependencies(location) {
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
			'--registry=https://origami-npm-registry-prototype.herokuapp.com'
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
			throw new Error(`${pkg[1]} is not in the npm regsitry`);
		} else {
			throw err;
		}

	}
}

module.exports = {
	installDependencies,
};
