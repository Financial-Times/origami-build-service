'use strict';

const RepoDataClient = require('@financial-times/origami-repo-data-client');
const semver = require('semver');
const UserError = require('../utils/usererror');
const lastBowerReleases = require('../data/last-bower-releases.json');

/**
 * The result of comparing a requested module / version against all releases.
 * @typedef {Object} ModuleResult
 * @property {string} name - The name of the requested module, including npm scope where relevant e.g. "o-table", "@financial-times/o-table".
 * @property {string} requestedVersion - The version range of the module requested, e.g. "1.0.0", "^1.0.0", "*", ""
 * @property {string|undefined} lastBowerMajor - The last major version of the component released to the Bower registry, before being published to npm-only.
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
		const highestRequestedVersion = semver.maxSatisfying(versions, requestedVersion) || requestedVersion;
		const latestVersionEntity = versionEntities.find(v => v.version === latestVersion);
		const latestOrigamiSpec = latestVersionEntity.origamiVersion;
		const satisfies = semver.satisfies(latestVersion, requestedVersion);
		const latestMajor = semver.coerce(semver.major(latestVersion));
		const requestedMajor = semver.coerce(semver.major(highestRequestedVersion));
		const lastBowerMajor = lastBowerReleases[nameWithoutScope];
		const firstNpmOnlyMajor = semver.inc(lastBowerMajor, 'major');
		const belowLatestBowerRelease = semver.gtr(lastBowerMajor, requestedVersion, { coerce: true });
		const belowLatestMajorRelease = semver.gtr(latestMajor, requestedVersion, { coerce: true });
		const aboveLatestRelease = semver.ltr(latestVersion, requestedVersion, { coerce: true });
		const npmNextUpgrade = semver.eq(requestedMajor, lastBowerMajor);
		const postNpmUpgrade = semver.lt(firstNpmOnlyMajor, latestMajor);

		results.push({
			name,
			requestedVersion,
			lastBowerMajor,
			versions,
			latestVersion,
			requestedMajor,
			satisfies,
			latestMajor,
			firstNpmOnlyMajor,
			belowLatestBowerRelease,
			belowLatestMajorRelease,
			aboveLatestRelease,
			npmNextUpgrade,
			postNpmUpgrade,
			latestOrigamiSpec
		});
	}

	results.sort((a, b) => ((a.satisfies === b.satisfies) ? 0 : a.satisfies ? 1 : -1));
	return results;
};
