'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
// const sinon = require('sinon');

describe('lib/registry', () => {
	let requestPromise;
	let Registry;

	beforeEach(() => {

		requestPromise = require('../mock/request-promise.mock');
		mockery.registerMock('./utils/request-promise', requestPromise);
		requestPromise.resolves({
			body: []
		});

		Registry = require('../../../lib/registry');
	});

	it('should export a function', () => {
		assert.isFunction(Registry);
	});

	describe('Registry(options)', () => {

		it('defaults the bowerRegistryURL to http://origami-bower-registry.ft.com', () => {
			const registry = new Registry();
			assert.equal(registry.bowerRegistryURL, 'http://origami-bower-registry.ft.com');
		});

		it('can specify the bowerRegistryURL', () => {
			const registry = new Registry({
				bowerRegistryURL: 'http://example.com'
			});
			assert.equal(registry.bowerRegistryURL, 'http://example.com');
		});

		describe('Registry.getPackageList()', () => {
			it('is a function', () => {
				const registry = new Registry();
				assert.isFunction(registry.getPackageList);
			});

			it('returns a Promise', () => {
				const registry = new Registry();
				assert.instanceOf(registry.getPackageList(), Promise);
			});

			it('requests /packages from bowerRegistryURL', () => {
				const registry = new Registry({
					bowerRegistryURL: 'http://example.com'
				});
				registry.getPackageList();
				assert.ok(requestPromise.calledWith({
					url: 'http://example.com/packages',
					json: true
				}));
			});

			it('returns the body of the response', () => {
				const packageList = [{
					a: 1
				},{
					b: 1
				}];
				requestPromise.resolves({
					body: packageList
				});
				const registry = new Registry();
				return registry.getPackageList().then(list => {
					assert.deepEqual(list, packageList);
				});
			});

			it('adds Registry instance as context when erroring', () => {
				requestPromise.rejects({});
				const registry = new Registry();
				return registry.getPackageList().catch(err => {
					assert.instanceOf(err.context, Registry);
					assert.deepEqual(err.context, registry);
				});
			});
		});

		describe('Registry.packageListByURL()', () => {
			it('is a function', () => {
				const registry = new Registry();
				assert.isFunction(registry.packageListByURL);
			});

			it('returns a Promise', () => {
				const registry = new Registry();
				assert.instanceOf(registry.packageListByURL(), Promise);
			});

			it('returns the package list as an object where the URLs are the keys', () => {
				const packageList = [
					{
						name: 'packageA',
						url: 'https://example.com/packageA'
					}, {
						name: 'packageB',
						url: 'https://foorbar.com/packageB'
					}
				];
				const expected = {
					'https://example.com/packageA': {
						name: 'packageA',
						url: 'https://example.com/packageA'
					},
					'https://foorbar.com/packageB': {
						name: 'packageB',
						url: 'https://foorbar.com/packageB'
					}
				};
				requestPromise.resolves({
					body: packageList
				});
				const registry = new Registry();
				return registry.packageListByURL().then(list => {
					assert.deepEqual(list, expected);
				});
			});
		});

	});

});
