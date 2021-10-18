'use strict';

const proclaim = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

const mockRepoDataClientVersionEntity = require('../../mock/repo-data-client-version-entity');

describe('lib/evaluate-modules', () => {

	let repoDataClientMock;
	let repoDataClientMockListVersionsStub;
	let evaluateModules;
	let UserError;

	beforeEach(function () {
		repoDataClientMockListVersionsStub = sinon.stub();
		const error404 = new Error();
		error404.status = 404;
		repoDataClientMockListVersionsStub.throws(error404);
		repoDataClientMockListVersionsStub.withArgs('o-test-component').returns([
			Object.assign({}, mockRepoDataClientVersionEntity, {
				name: 'o-test-component',
				version: '1.5.0',
				versionTag: 'v1.5.0',
				origamiVersion: 'v1'
			}),
			Object.assign({}, mockRepoDataClientVersionEntity, {
				name: 'o-test-component',
				version: '2.1.0',
				versionTag: 'v2.1.0',
				origamiVersion: 'v2'
			}),
			Object.assign({}, mockRepoDataClientVersionEntity, {
				name: 'o-test-component',
				version: '2.1.0-beta.1',
				versionTag: 'v2.1.0-beta.1',
				origamiVersion: 'v2'
			})
		]);
		repoDataClientMockListVersionsStub.withArgs('o-example').returns([
			Object.assign({}, mockRepoDataClientVersionEntity, {
				name: 'o-example',
				version: '1.0.0',
				versionTag: 'v1.0.0',
				origamiVersion: 'v2'
			}),
			Object.assign({}, mockRepoDataClientVersionEntity, {
				name: 'o-example',
				version: '1.1.0-beta.1',
				versionTag: 'v1.1.0-beta.1',
				origamiVersion: 'v2'
			}),
			Object.assign({}, mockRepoDataClientVersionEntity, {
				name: 'o-example',
				version: '2.0.0',
				versionTag: 'v2.0.0',
				origamiVersion: 'v2'
			})
		]);
		repoDataClientMock = function() {};
		repoDataClientMock.prototype.listVersions = repoDataClientMockListVersionsStub;
		mockery.registerMock(
			'@financial-times/origami-repo-data-client',
			repoDataClientMock
		);

		evaluateModules = require('../../../../lib/url-updater/evaluate-modules');
		UserError = require('../../../../lib/utils/usererror');
	});

	it('calls repo data with the component name without published scope', async () => {
		await evaluateModules([
			['o-test-component', '^1'],
			['@financial-times/o-test-component', '^2']
		]);

		proclaim.isTrue(
			repoDataClientMockListVersionsStub.alwaysCalledWith('o-test-component'),
			'Repo data was not called with the expected component name, which could result in incorrect results.'
		);
	});

	it('includes the module name', async () => {
		const results = await evaluateModules([['o-test-component', '^1']]);
		proclaim.equal(results[0].name, 'o-test-component');
	});

	it('includes the requested version', async () => {
		const results = await evaluateModules([['o-test-component', '^1']]);
		proclaim.equal(results[0].requestedVersion, '^1');
	});

	it('includes the latest non-prerelease version number', async () => {
		const results = await evaluateModules([['o-test-component', '^1']]);
		proclaim.equal(results[0].latestVersion, '2.1.0');
	});

	it('includes an array of all version numbers', async () => {
		const result = await evaluateModules([['o-test-component', '^1']]);
		proclaim.lengthEquals(result, 1, 'Expected one result for the requested component.');
		proclaim.deepEqual(result[0].versions, ['1.5.0', '2.1.0', '2.1.0-beta.1'], 'Expected all versions of the requested component to be returned in the result.');
	});

	it('includes whether the requested version is the latest version', async () => {
		const resultV1 = await evaluateModules([['o-test-component', '^1']]);
		proclaim.isFalse(resultV1[0].satisfies, 'Did not expect the given component version/range to satisfy the latest version.');
		const resultV2 = await evaluateModules([['o-test-component', '^2']]);
		proclaim.isTrue(resultV2[0].satisfies, 'Expected the given component version/range to satisfy the latest version.');
	});

	it('sorts by out of date results first', async () => {
		const result1 = await evaluateModules([['o-test-component', '^1'], ['o-example', '^2']]);
		proclaim.equal(result1[0].name, 'o-test-component', 'Expected "o-test-component" to be the first result, as the version given is behind the latest release when other modules given are not.');
		const result2 = await evaluateModules([['o-test-component', '^2'], ['o-example', '^1']]);
		proclaim.equal(result2[0].name, 'o-example', 'Expected "o-example" to be the first result, as the version given is behind the latest release when other modules given are not.');
	});

	it('throws a user error if the module is not found', async () => {
		try {
			await evaluateModules([['o-no-i-do-not-exist', '^1'], ['o-example', '^2']]);
		} catch(e) {
			return proclaim.isInstanceOf(e, UserError, 'An error was thrown but not a user error.');
		}
		proclaim.ok(false, 'An error was not throw.');
	});
});
