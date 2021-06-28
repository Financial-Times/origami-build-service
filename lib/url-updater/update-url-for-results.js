'use strict';

const RepoDataClient = require('@financial-times/origami-repo-data-client');
const semver = require('semver');

/**
 * @param {URL} url - The original Build Service URL
 * @param {ModuleResult[]} results - Details about the requested modules and how up to date they are.
 * @return {URL} - A Build Service URL updated for the latest releases of components.
 */
module.exports = async function updateUrlForResults(url, results) {
	const hasOnlySpecV1Components = results.every(v => v.latestOrigamiSpec === '1');
	const hasComponentsBehindTheLatestBowerMajor = results
		.some(component => component.belowLatestBowerRelease);

	const minimumBuildServiceVersion = hasOnlySpecV1Components || hasComponentsBehindTheLatestBowerMajor ? 2 : 3;

	const updatedUrl = new URL(
		url.toString().replace(
			/(?<=service\/build\/v)([1-2])(?=\/)/,
			minimumBuildServiceVersion
		));

	const componentParam = minimumBuildServiceVersion === 2 ? 'modules' : 'components';
	const unsupportedComponentParam = minimumBuildServiceVersion === 2 ? 'components' : 'modules';

	const componentParamValue = results.map(c => `${c.name}@${hasComponentsBehindTheLatestBowerMajor ? (c.belowLatestBowerRelease ? `^${c.lastBowerMajor}` : c.requestedVersion) : `^${c.latestVersion}`}`);
	const includesAutoInitComponent = results.find(({name}) => name === 'o-autoinit');
	if (minimumBuildServiceVersion === 3 && !includesAutoInitComponent) {
		const repoData = new RepoDataClient({});
		const autoInitVersions = await repoData.listVersions('o-autoinit');
		const autoInitVersionNumbers = autoInitVersions.map(v => v.version);
		const autoinitLatestVersionNumber = semver.maxSatisfying(autoInitVersionNumbers, '>1.0.0');
		componentParamValue.push(`o-autoinit@^${autoinitLatestVersionNumber}`);
	}

	updatedUrl.searchParams.delete(unsupportedComponentParam);
	updatedUrl.searchParams.set(
		componentParam,
		componentParamValue
	);

	// Query param order may have changed. Ensure components are listed first.
	const brand = updatedUrl.searchParams.get('brand');
	if (brand) {
		updatedUrl.searchParams.delete('brand');
		updatedUrl.searchParams.set(
			'brand',
			brand
		);
	}

	// Query param order may have changed. Ensure components are listed first.
	const systemCode = updatedUrl.searchParams.get('system_code');
	if (systemCode) {
		updatedUrl.searchParams.delete('system_code');
		updatedUrl.searchParams.set(
			'system_code',
			systemCode
		);
	}

	return updatedUrl;
};
