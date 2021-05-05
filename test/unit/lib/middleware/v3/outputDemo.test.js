/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const httpMock = require('node-mocks-http');
const outputDemo = require('../../../../../lib/middleware/v3/outputDemo').outputDemo;

describe('outputDemo', function () {
	this.timeout(10 * 1000);

	it('it is a function', async () => {
		proclaim.isFunction(outputDemo);
	});

	context('when given a valid request', function () {

		context('and the response takes more than 25 seconds to be generated', function () {
			this.timeout(30000);

			let fakeNpmRegistryAddress;
			let fakeNpmRegistry;
			beforeEach(function() {
				fakeNpmRegistry = require('express')().use(() => {}).listen(0);
				fakeNpmRegistryAddress = `http://localhost:${fakeNpmRegistry.address().port}`;
			});

			afterEach( function() {
				fakeNpmRegistry.close();
			});

			it('it responds with a redirect back to the same location', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: fakeNpmRegistryAddress
						}
					}
				};
				request.basePath = '/';
				request.path = '/v3/demo';
				request.query.component = 'o-test-component@2.2.1';
				request.query.demo = 'test-demo';
				request.query.system_code = 'origami';
				request.query.brand = 'master';

				await outputDemo(request, response);

				proclaim.deepStrictEqual(response.statusCode, 307);
				proclaim.deepStrictEqual(
					response.getHeader('location'),
					'/v3/demo?component=o-test-component%402.2.1&demo=test-demo&system_code=origami&brand=master'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'private, no-store'
				);

			});
		});
	});
});
