'use strict';

const execa = require('execa');

const appRoot = require('app-root-path');
const path = require('path');
const decompress = require('decompress');
const UserError = require('../../../lib/utils/usererror');

const npm = path.join(appRoot.toString(), './node_modules/.bin/npm');
const npmCacheLocation = path.join(appRoot.toString(), './.npm-cache');

/**
 * Downloads the specific package version using only the cache provided.
 * If the package version is not in the cache then the returned Promise is rejected.
 *
 * @param {String} location Folder location to download the package into
 * @param {String} name The name of the package
 * @param {String} version The version of the package
 * @param {String} [registry] The npm Registry url to use for downloading the package from
 * @returns {Promise<string>}
 */
async function downloadFromCacheOnly(location, name, version, registry) {
	const {stdout} = await execa.command(
		`${npm} pack ${name}@${version} --registry=${registry} --cache=${npmCacheLocation} --offline`,
		{
			cwd: location,
			preferLocal: false,
			shell: true,
		});
	return stdout;
}

/**
 *
 * Downloads the specific package version using the cache provided, if the package version is
 * not in the cache then the npm client will make a request to the provided registry to download
 * the specific package version's tarball.
 * 
 * @param {String} location Folder location to download the package into
 * @param {String} name The name of the package
 * @param {String} version The version of the package
 * @param {String} [registry] The npm Registry url to use for downloading the package from
 * @returns {Promise<string>}
 */
async function downloadFromCacheWithNetworkFallback(location, name, version, registry) {
	const {stdout} = await execa.command(
		`${npm} pack ${name}@${version} --registry=${registry} --cache=${npmCacheLocation} --prefer-offline `,
		{
			cwd: location,
			preferLocal: false,
			shell: true,
		});
	return stdout;
}

/**
 * Downloads the specific package version from the specified npm registry into the specified folder
 *
 * @param {String} location Folder location to download the package into
 * @param {String} name The name of the package
 * @param {String} version The version of the package
 * @param {String} [registry] The npm Registry url to use for downloading the package from
 * @returns {Promise<void>}
 */
async function downloadAndUnpackPackage(location, name, version, registry = 'https://registry.npmjs.org/') {
	try {
		const filenameOfCompressedPackage = await downloadFromCacheOnly(location, name, version, registry).catch(() => downloadFromCacheWithNetworkFallback(location, name, version, registry));
		const packageLocation = path.join(location, filenameOfCompressedPackage);
		await decompress(packageLocation, location, {strip:1});
	} catch (err) {
		if (err.stderr.includes('E404')) {
			const line = err.stderr.split('npm ERR!').find(line => line.includes('is not in the npm registry'));
			const pkg = line.match(/ 404  '([^']*)' is not in the npm registry/);
			throw new UserError(`${pkg[1]} is not in the npm registry`);
		} else if (err.stderr.includes('ETARGET')) {
			const line = err.stderr.split('npm ERR!').find(line => line.includes('No matching version found for'));
			const pkg = line.match(/No matching version found for ([^']*)\./);
			throw new UserError(`${pkg[1]} is not in the npm registry`);
		} else {
			throw err;
		}

		// TODO: Catch invalid version error
		// TODO: Catch missing version error
	}
}

module.exports = {
	downloadAndUnpackPackage,
};
