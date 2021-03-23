'use strict';

const proclaim = require('proclaim');
const updateUrlForResults = require('../../../../lib/url-updater/update-url-for-results');

describe('lib/update-url-for-results.test', () => {

	const specV1Result = {
		name: 'o-example',
		requestedVersion: '^1.0.0',
		versions: ['1.0.0', '1.0.1'],
		latestVersion: '1.0.1',
		satisfies: true,
		latestOrigamiSpec: '1'
	};

	const specV2Result = {
		name: 'o-test-component',
		requestedVersion: '^1.0.0',
		versions: ['1.0.0', '2.1.0'],
		latestVersion: '2.1.0',
		satisfies: false,
		latestOrigamiSpec: '2'
	};

	describe('given a Build Service url and module results', () => {
		describe('where all results follow v1 of the Origami Component specification', () => {
			it('sets modules with the Build Service version to v2', () => {
				const updatedUrl = updateUrlForResults(
					'https://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-example@^1.0.0&brand=internal',
					[specV1Result]
				);
				proclaim.equal(
					decodeURIComponent(updatedUrl.toString()),
					'https://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-example@^1.0.1&brand=internal'
				);
			});
		});

		describe('where all results follow v2 of the Origami Component specification', () => {
			it('sets modules with the Build Service version to v3', () => {
				const updatedUrl = updateUrlForResults(
					'https://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-test-component@^2.1.0&brand=internal',
					[specV2Result]
				);
				proclaim.equal(
					decodeURIComponent(updatedUrl.toString()),
					'https://www.ft.com/__origami/service/build/v3/bundles/css?modules=o-test-component@^2.1.0&brand=internal'
				);
			});
		});

		describe('where 1 module follows v2 of the Origami Component specification, and the rest v1', () => {
			it('sets the Build Service version to v3', () => {
				const updatedUrl = updateUrlForResults(
					'https://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-example@^1.0.0,o-test-component@^2.1.0&brand=internal',
					[specV1Result, specV2Result]
				);
				proclaim.equal(
					decodeURIComponent(updatedUrl.toString()),
					'https://www.ft.com/__origami/service/build/v3/bundles/css?modules=o-example@^1.0.1,o-test-component@^2.1.0&brand=internal'
				);
			});
		});
	});
});
