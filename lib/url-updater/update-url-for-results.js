'use strict';

const RepoDataClient = require('@financial-times/origami-repo-data-client');
const semver = require('semver');

/**
 * @param {URL} url - The original Build Service URL
 * @param {ModuleResult[]} results - Details about the requested modules and how up to date they are.
 * @return {URL} - A Build Service URL updated for the latest releases of components.
 */
module.exports = async function updateUrlForResults(url, results) {
	const hasComponentsBehindTheLatestBowerMajor = results
		.some(component => component.belowLatestBowerRelease);

	const originalBuildServiceVersion = url.toString().includes('service/build/v2/') ? 2 : 3;
	const targetBuildServiceVersion = hasComponentsBehindTheLatestBowerMajor ? 2 : 3;

	const updatedUrl = new URL(
		url.toString().replace(
			/(?<=service\/build\/v)([1-2])(?=\/)/,
			targetBuildServiceVersion
		));

	// Decide if to set a component or module param
	const componentParam = targetBuildServiceVersion === 2 ? 'modules' : 'components';
	const unsupportedComponentParam = targetBuildServiceVersion === 2 ? 'components' : 'modules';

	// Find component/module param value
	const componentParamValue = results.map(c => {
		let version = `^${c.latestVersion}`;
		if (hasComponentsBehindTheLatestBowerMajor) {
			if (c.belowLatestBowerRelease) {
				version = `^${c.lastBowerMajor}`;
			} else {
				version = c.requestedVersion;
			}
		}
		return `${c.name}@${version}`;
	});

	// Update auto init
	const v2AutoInit = originalBuildServiceVersion === 2 && (
		url.searchParams.has('autoinit') === false ||
		url.searchParams.get('autoinit') !== '0'
	);

	const includesAutoInitComponent = results.find(({name}) => name === 'o-autoinit');
	if (v2AutoInit && (targetBuildServiceVersion === 3 && !includesAutoInitComponent)) {
		const repoData = new RepoDataClient({});
		const autoInitVersions = await repoData.listVersions('o-autoinit');
		const autoInitVersionNumbers = autoInitVersions.map(v => v.version);
		const autoinitLatestVersionNumber = semver.maxSatisfying(autoInitVersionNumbers, '>1.0.0');
		componentParamValue.push(`o-autoinit@^${autoinitLatestVersionNumber}`);
	}

	if (targetBuildServiceVersion === 3) {
		updatedUrl.searchParams.delete('autoinit');
	}

	// Set component/module param
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
