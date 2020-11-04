'use strict';

const execa = require('execa');

/**
 * Installs the dependencies for the package.json file located at `location`
 *
 * @param {String} location
 * @returns {Promise<void>}
 */
async function installDependencies(location) {
	await execa(
		'npm',
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
			'--registry="https://origami-npm-registry-prototype.herokuapp.com"'
		],
		{
			cwd: location,
			preferLocal: true
		}
	);
}

module.exports = {
	installDependencies,
};
