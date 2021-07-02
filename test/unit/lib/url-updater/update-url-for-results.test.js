'use strict';

const proclaim = require('proclaim');
const updateUrlForResults = require('../../../../lib/url-updater/update-url-for-results');

describe('lib/update-url-for-results.test', () => {

	const specV1Result = {
		name: 'o-example',
		requestedVersion: '^1.0.0',
		versions: ['1.0.0', '1.0.1'],
		latestVersion: '1.0.1',
		satisfies: true
	};

	const bowerRequestedNpmAvailable = {
		name: 'o-test-component',
		requestedVersion: '^1.0.0',
		lastBowerMajor: '1.0.0',
		versions: ['1.0.0', '2.1.0'],
		latestVersion: '2.1.0',
		requestedMajor: '1.0.0',
		satisfies: false,
		latestMajor: '2.0.0',
		firstNpmOnlyMajor: true,
		belowLatestBowerRelease: false,
		belowLatestMajorRelease: true,
		aboveLatestRelease: false,
		requestedLastBowerMajor: true,
		hasFurtherNpmOnlyMajorReleases: false
	};

	const earlyBowerRequestedFutureNpmAvailable = {
		name: 'o-dummy',
		requestedVersion: '^1.0.0',
		lastBowerMajor: '2.0.0',
		versions: ['1.0.0', '2.1.0', '3.0.0'],
		latestVersion: '3.0.0',
		requestedMajor: '1.0.0',
		satisfies: false,
		latestMajor: '3.0.0',
		firstNpmOnlyMajor: true,
		belowLatestBowerRelease: true,
		belowLatestMajorRelease: true,
		aboveLatestRelease: false,
		requestedLastBowerMajor: false,
		hasFurtherNpmOnlyMajorReleases: false
	};

	describe('given a Build Service url and module results', () => {
		describe('where all results do not follow v1 of the Origami Component specification', () => {
			it('sets modules with the Build Service version to v3', async () => {
				const updatedUrl = await updateUrlForResults(
					new URL('https://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-test-component@^2.1.0&brand=internal'),
					[bowerRequestedNpmAvailable]
				);
				proclaim.equal(
					decodeURIComponent(updatedUrl.toString()),
					'https://www.ft.com/__origami/service/build/v3/bundles/css?components=o-test-component@^2.1.0,o-autoinit@^2.0.7&brand=internal'
				);
			});
		});

		describe('where all results with one exception follow v1 of the Origami Component specification', () => {
			it('sets the Build Service version to v3', async () => {
				const updatedUrl = await updateUrlForResults(
					new URL('https://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-example@^1.0.0,o-test-component@^2.1.0&brand=internal'),
					[specV1Result, bowerRequestedNpmAvailable]
				);
				proclaim.equal(
					decodeURIComponent(updatedUrl.toString()),
					'https://www.ft.com/__origami/service/build/v3/bundles/css?components=o-example@^1.0.1,o-test-component@^2.1.0,o-autoinit@^2.0.7&brand=internal'
				);
			});
		});

		describe('where all results with one exception follow v1 of the Origami Component specification', () => {
			it('sets the Build Service version to v3', async () => {
				const updatedUrl = await updateUrlForResults(
					new URL('https://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-example@^1.0.0,o-test-component@^2.1.0&brand=internal'),
					[specV1Result, bowerRequestedNpmAvailable]
				);
				proclaim.equal(
					decodeURIComponent(updatedUrl.toString()),
					'https://www.ft.com/__origami/service/build/v3/bundles/css?components=o-example@^1.0.1,o-test-component@^2.1.0,o-autoinit@^2.0.7&brand=internal'
				);
			});
		});

		describe('where the requested version is below the first npm-only release', () => {
			it('sets the Build Service version to v3', async () => {
				const updatedUrl = await updateUrlForResults(
					new URL('https://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-example@^1.0.0,o-test-component@^2.1.0&brand=internal'),
					[specV1Result, bowerRequestedNpmAvailable]
				);
				proclaim.equal(
					decodeURIComponent(updatedUrl.toString()),
					'https://www.ft.com/__origami/service/build/v3/bundles/css?components=o-example@^1.0.1,o-test-component@^2.1.0,o-autoinit@^2.0.7&brand=internal'
				);
			});
		});

		describe('where the requested version is below the last Bower release and a future npm-only release is available', () => {
			it('sets the Build Service version to v2 with the last Bower release', async () => {
				const updatedUrl = await updateUrlForResults(
					new URL('https://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-dummy@^1.0.0&brand=internal'),
					[earlyBowerRequestedFutureNpmAvailable]
				);
				proclaim.equal(
					decodeURIComponent(updatedUrl.toString()),
					'https://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-dummy@^2.0.0&brand=internal'
				);
			});
		});
	});
});
