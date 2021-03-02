'use strict';

const RepoDataClient = require('@financial-times/origami-repo-data-client');
const semver = require('semver');
const UserError = require('../utils/usererror');

/**
 * The result of comparing a requested module / version against all releases.
 * @typedef {Object} ModuleResult
 * @property {string} name - The name of the requested module, including npm scope where relevant e.g. "o-table", "@financial-times/o-table".
 * @property {string} requestedVersion - The version range of the module requested, e.g. "1.0.0", "^1.0.0", "*", ""
 * @property {string[]} versions - All version numbers for the module, e.g. "2.0.1", "3.0.0-beta.1"
 * @property {string} latestVersion - The latest version of the module.
 * @property {boolean} satisfies - Whether the latest version of the module is the version requested, or within its range.
 * @property {string} latestOrigamiSpec - The version of the Origami Specification which the latest release of the module conforms to.
 */

/**
 * @param {Array[]} - An array of arrays representing requested modules, e.g. [['o-example', 'v1.0.0'], 'o-test-component', '']
 * @return {ModuleResult[]} - Details about the requested modules and how up to date they are.
 */
module.exports = async function evaluateModules(modules) {
	const repoData = new RepoDataClient({});
	const results = [];

	for (const module of modules) {
		const name = module[0];
		const nameWithoutScope = name.split('/').pop();
		const requestedVersion = module[1];
		let versionEntities;
		try {
			versionEntities = await repoData.listVersions(nameWithoutScope);
			versionEntities = versionEntities || [];
		} catch (error) {
			if (error.status === 404) {
				throw new UserError(`Could not find "${name}" releases to check if it's up to date, is it an Origami component?`);
			}
			throw error;
		}
		const versions = versionEntities.map(v => v.version);
		const latestVersion = semver.maxSatisfying(versions, '>1.0.0');
		const latestVersionEntity = versionEntities.find(v => v.version === latestVersion);
		const latestOrigamiSpec = latestVersionEntity.origamiVersion;
		const satisfies = semver.satisfies(latestVersion, requestedVersion);
		results.push({ name, requestedVersion, versions, latestVersion, satisfies, latestOrigamiSpec });
	}

	results.sort((a, b) => ((a.satisfies === b.satisfies) ? 0 : a.satisfies ? 1 : -1));
	return results;
};
