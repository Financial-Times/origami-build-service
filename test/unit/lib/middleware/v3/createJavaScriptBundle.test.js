/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const getEcmaVersion = require('detect-es-version').getEcmaVersion;
const vm = require('vm');
const sinon = require('sinon');
const httpMock = require('node-mocks-http');

describe('createJavaScriptBundle', function () {
	this.timeout(10 * 1000);
	let createJavaScriptBundle;

	beforeEach(function () {
		createJavaScriptBundle = require('../../../../../lib/middleware/v3/createJavaScriptBundle')
			.createJavaScriptBundle;
	});

	it('it is a function', async () => {
		proclaim.isFunction(createJavaScriptBundle);
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
				request.path = '/v3/bundles/js';
				request.query.components = 'o-test-component@2.2.9';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				proclaim.deepStrictEqual(response.statusCode, 307);
				proclaim.deepStrictEqual(
					response.getHeader('location'),
					'/v3/bundles/js?components=o-test-component%402.2.9&system_code=origami'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'private, no-store'
				);

			});
		});

		it('it responds with a javascript bundle which contains the requested component', async () => {
			const request = httpMock.createRequest();
			const response = httpMock.createResponse();
			response.startTime = sinon.spy();
			response.endTime = sinon.spy();
			request.app = {
				ft: {
					options: {
						npmRegistryURL: 'https://registry.npmjs.org'
					}
				}
			};
			request.query.components = 'o-test-component@2.2.9';
			request.query.system_code = 'origami';

			await createJavaScriptBundle(request, response);

			const bundle = response._getData();

			proclaim.include(
				bundle,
				'self.Origami["o-test-component"].default=void 0})();})()'
			);
			proclaim.deepStrictEqual(response.statusCode, 200);
			proclaim.deepStrictEqual(
				response.getHeader('content-type'),
				'application/javascript;charset=UTF-8'
			);
			proclaim.deepStrictEqual(
				response.getHeader('cache-control'),
				'public, max-age=86400, stale-if-error=604800, stale-while-revalidate=300000'
			);

			proclaim.deepStrictEqual(getEcmaVersion(bundle), 5);

			const script = new vm.Script(bundle);

			const context = {};
			context.self = context;
			script.runInNewContext(context);
			proclaim.isObject(context.Origami);
			proclaim.isObject(context.Origami['o-test-component']);
		});
	});

	context('when given a valid request but the component is origami v1', function () {
		it('it responds with an error message', async () => {
			const request = httpMock.createRequest();
			const response = httpMock.createResponse();
			response.startTime = sinon.spy();
			response.endTime = sinon.spy();
			request.app = {
				ft: {
					options: {
						npmRegistryURL: 'https://registry.npmjs.org'
					}
				}
			};
			request.query.components = 'o-utils@1.1.7';
			request.query.system_code = 'origami';

			await createJavaScriptBundle(request, response);

			const bundle = response._getData();

			proclaim.deepStrictEqual(
				bundle,
				'Origami Build Service returned an error: "o-utils@1.1.7 is not an Origami v2 component, the Origami Build Service v3 API only supports Origami v2 components."'
			);
			proclaim.deepStrictEqual(response.statusCode, 400);
			proclaim.deepStrictEqual(
				response.getHeader('content-type'),
				'text/plain; charset=UTF-8'
			);
			proclaim.deepStrictEqual(
				response.getHeader('cache-control'),
				'max-age=0, must-revalidate, no-cache, no-store'
			);
		});
	});

	context('when given a request with no components parameter', function () {
		it('it responds with a plain text error message', async () => {
			const request = httpMock.createRequest();
			const response = httpMock.createResponse();
			response.startTime = sinon.spy();
			response.endTime = sinon.spy();
			request.app = {
				ft: {
					options: {
						npmRegistryURL: 'https://registry.npmjs.org'
					}
				}
			};
			request.query.system_code = 'origami';

			await createJavaScriptBundle(request, response);

			const bundle = response._getData();

			proclaim.deepStrictEqual(
				response.getHeader('content-type'),
				'text/plain; charset=UTF-8'
			);
			proclaim.deepStrictEqual(
				response.getHeader('cache-control'),
				'max-age=0, must-revalidate, no-cache, no-store'
			);
			proclaim.deepStrictEqual(response.statusCode, 400);

			proclaim.deepStrictEqual(
				bundle,
				'Origami Build Service returned an error: "The components query parameter can not be empty."'
			);
		});
	});

	context(
		'when given a request with components parameter as empty string',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = '';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The components query parameter can not be empty."'
				);
			});
		}
	);

	context(
		'when given a request with a components parameter which contains duplicates',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = 'o-test@1,o-test@1';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The components query parameter contains duplicate component names. Please remove one of the follow from the components parameter: o-test"'
				);
			});
		}
	);
	context(
		'when given a request with a components parameter which contains empty component names',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = 'o-test@1,,';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The components query parameter can not contain empty component names."'
				);
			});
		}
	);
	context(
		'when given a request with a components parameter which contains a component name with whitespace at the start',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = ' o-test@1';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The components query parameter contains component names which have whitespace at either the start of end of their name. Remove the whitespace from ` o-test@1` to make the component name valid."'
				);
			});
		}
	);
	context(
		'when given a request with a components parameter which contains a component name with whitespace at the end',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = 'o-test@1 ';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The components query parameter contains component names which have whitespace at either the start of end of their name. Remove the whitespace from `o-test@1 ` to make the component name valid."'
				);
			});
		}
	);
	context(
		'when given a request with a components parameter which contains a component name without a version',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = 'o-test';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The bundle request contains o-test with no version range, a version range is required.\\nPlease refer to TODO (build service documentation) for what is a valid version."'
				);
			});
		}
	);
	context(
		'when given a request with a components parameter which contains a component name with an invalid version',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = 'o-test@5wg';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The version 5wg in o-test@5wg is not a valid version.\\nPlease refer to TODO (build service documentation) for what is a valid version."'
				);
			});
		}
	);
	context(
		'when given a request with a components parameter which contains a invalid component names',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = 'o-TeSt@5';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The components query parameter contains component names which are not valid: o-TeSt."'
				);
			});
		}
	);

	context(
		'when given a request with an invalid system code',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = 'o-test-component@2.2.9';
				request.query.system_code = '$$origami!';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The system_code query parameter must be a valid Biz-Ops System Code."'
				);
			});
		}
	);
});
