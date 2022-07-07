'use strict';

const execa = require('execa');
const appRoot = require('app-root-path');
const path = require('path');
const UserError = require('../../utils/usererror');

const npm = path.join(appRoot.toString(), './node_modules/.bin/npm');

/**
 * Installs the dependencies for the package.json file located at `location` using only the cache provided.
 * If any of the required packages are not in the cache then the returned Promise is rejected.
 *
 * @param {String} location Folder location to run `npm install` within.
 * @param {String} [registry] The npm Registry url to use for downloading the package from
 * @returns {Promise<void>}
 */
async function downloadFromCacheOnly(location, registry, installOnlyProductionDependencies = true) {
	let npmInstallCommand = `${npm} install --offline --ignore-scripts --no-package-lock --no-audit --progress=false --fund=false --package-lock=false --strict-peer-deps --update-notifier=false --bin-links=false --registry=${registry}`;
	if (installOnlyProductionDependencies) {
		npmInstallCommand += ' --production';
	} else {
		// Install devDependencies even when the NODE_ENV environment variable is set to 'production'
		npmInstallCommand += ' --omit';
	}

	await execa.command(
		npmInstallCommand,
		{
			cwd: location,
			preferLocal: false,
			shell: true,
		});
}

/**
 * Installs the dependencies for the package.json file located at `location`using the cache provided,
 * if any of the required packages are not in the cache then the npm client will make requests to the
 * provided registry to download the missing packages.
 *
 * @param {String} location Folder location to download the package into
 * @param {String} [registry] The npm Registry url to use for downloading the package from
 * @returns {Promise<void>}
 */
async function downloadFromCacheWithNetworkFallback(location, registry, installOnlyProductionDependencies = true) {
	let npmInstallCommand = `${npm} install --prefer-offline --ignore-scripts --no-package-lock --no-audit --progress=false --fund=false --package-lock=false --strict-peer-deps --update-notifier=false --bin-links=false --registry=${registry}`;
	if (installOnlyProductionDependencies) {
		npmInstallCommand += ' --production';
	} else {
		// Install devDependencies even when the NODE_ENV environment variable is set to 'production'
		npmInstallCommand += ' --omit';
	}
	await execa.command(
		npmInstallCommand,
		{
			cwd: location,
			preferLocal: false,
			shell: true,
		});
}

/**
 * Installs the dependencies for the package.json file located at `location` using the provided
 * registry and also inserts into the cache provided.
 *
 * @param {String} location Folder location to download the package into
 * @param {String} [registry] The npm Registry url to use for downloading the package from
 * @returns {Promise<void>}
 */
async function downloadFromNetworkAndUpdateCache (location, registry, installOnlyProductionDependencies = true) {
	let npmInstallCommand = `${npm} install --ignore-scripts --no-package-lock --no-audit --progress=false --fund=false --package-lock=false --strict-peer-deps --update-notifier=false --bin-links=false --registry=${registry}`;
	if (installOnlyProductionDependencies) {
		npmInstallCommand += ' --production';
	} else {
		// Install devDependencies even when the NODE_ENV environment variable is set to 'production'
		npmInstallCommand += ' --omit';
	}
	await execa.command(
		npmInstallCommand,
		{
			cwd: location,
			preferLocal: false,
			shell: true,
		});
}

/**
 * Installs the dependencies for the package.json file located at `location`
 *
 * @param {String} location Folder location to run `npm install` within.
 * @param {String} [registry] The npm Registry url to use when installing the dependencies
 * @returns {Promise<void>}
 */
async function installDependencies(location, registry = 'https://registry.npmjs.org/', installOnlyProductionDependencies = true) {
	try {
		await downloadFromCacheOnly(location, registry, installOnlyProductionDependencies)
			.catch(() => downloadFromCacheWithNetworkFallback(location, registry, installOnlyProductionDependencies))
			.catch(() => downloadFromNetworkAndUpdateCache(location, registry, installOnlyProductionDependencies));
	} catch (err) {
		if (err.stderr.includes('E404')) {
			const line = err.stderr.split('npm ERR!').find(line => line.includes('is not in this registry'));
			const pkg = line.match(/ 404  '([^']*)' is not in this registry/);
			throw new UserError(`${pkg[1]} is not in this registry`);
		} else if (err.stderr.includes('ETARGET')) {
			const line = err.stderr.split('npm ERR!').find(line => line.includes('No matching version found for'));
			const pkg = line.match(/No matching version found for (.*)./);
			throw new UserError(`${pkg[1]} is not in this registry`);
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
