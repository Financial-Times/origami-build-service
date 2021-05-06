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


	const componentParam = minimumBuildServiceVersion === 2 ? 'modules' : 'components';
	const unsupportedComponentParam = minimumBuildServiceVersion === 2 ? 'components' : 'modules';
	updatedUrl.searchParams.delete(unsupportedComponentParam);
	updatedUrl.searchParams.set(
		componentParam,
		results.map(c => `${c.name}@^${c.latestVersion}`)
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
