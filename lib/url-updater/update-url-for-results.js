'use strict';

/**
 * @param {URL} url - The original Build Service URL
 * @param {ModuleResult[]} results - Details about the requested modules and how up to date they are.
 * @return {URL} - A Build Service URL updated for the latest releases of components.
 */
module.exports = function updateUrlForResults(url, results) {
	const hasOnlySpecV1Components = results.every(v => v.latestOrigamiSpec === '1');
	const minimumBuildServiceVersion = hasOnlySpecV1Components ? 2 : 3;
	const updatedUrl = new URL(
		url.toString().replace(
			/(?<=service\/build\/v)([1-2])(?=\/)/,
			minimumBuildServiceVersion
		));
	updatedUrl.searchParams.set(
		'modules',
		results.map(c => `${c.name}@^${c.latestVersion}`)
	);
	return updatedUrl;
};
