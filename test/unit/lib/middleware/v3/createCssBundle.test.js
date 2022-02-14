/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const sinon = require('sinon');
const httpMock = require('node-mocks-http');
const createCssBundle = require('../../../../../lib/middleware/v3/createCssBundle').createCssBundle;

describe('createCssBundle', function () {
	this.timeout(10 * 1000);

	it('it is a function', async () => {
		proclaim.isFunction(createCssBundle);
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
				request.path = '/v3/bundles/css';
				request.query.components = 'o-test-component@v2.2.2';
				request.query.brand = 'master';
				request.query.system_code = 'origami';

				await createCssBundle(request, response);

				proclaim.deepStrictEqual(response.statusCode, 307);
				proclaim.deepStrictEqual(
					response.getHeader('location'),
					'/v3/bundles/css?components=o-test-component%40v2.2.2&brand=master&system_code=origami'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'private, no-store'
				);

			});
		});
		it('it responds with a css bundle which contains the requested component', async () => {
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
			request.query.components = 'o-test-component@v2.2.2';
			request.query.brand = 'master';
			request.query.system_code = 'origami';

			await createCssBundle(request, response);

			const bundle = response._getData();

			proclaim.deepStrictEqual(
				bundle,
				'.o-test-component{padding:.5em 1em;background-color:pink}.o-test-component:after{content:\'Hello world!  The square root of 64 is "8".\'}\n'
			);
			proclaim.deepStrictEqual(response.statusCode, 200);
			proclaim.deepStrictEqual(
				response.getHeader('content-type'),
				'text/css; charset=UTF-8'
			);
			proclaim.deepStrictEqual(
				response.getHeader('cache-control'),
				'public, max-age=86400, stale-if-error=604800, stale-while-revalidate=300000'
			);

		});
	});

	context('when given a valid request but the component is origami v1', function () {
		it('it responds with a css bundle which contains the requested component', async () => {
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
			request.query.components = 'o-utils@1';
			request.query.brand = 'master';
			request.query.system_code = 'origami';

			await createCssBundle(request, response);

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
				'Origami Build Service returned an error: \"o-utils@1 is not an Origami v2 component, the Origami Build Service v3 API only supports Origami v2 components.\"'
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

			await createCssBundle(request, response);

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
				'Origami Build Service returned an error: \"The components query parameter can not be empty.\"'
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

				await createCssBundle(request, response);

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
					'Origami Build Service returned an error: \"The components query parameter can not be empty.\"'
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

				await createCssBundle(request, response);

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
					'Origami Build Service returned an error: \"The components query parameter contains duplicate component names. Please remove one of the follow from the components parameter: o-test\"'
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

				await createCssBundle(request, response);

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
					'Origami Build Service returned an error: \"The components query parameter can not contain empty component names.\"'
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
				request.query.components = ' @financial-times/o-test@1';

				await createCssBundle(request, response);

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
					'Origami Build Service returned an error: \"The components query parameter contains component names which have whitespace at either the start of end of their name. Remove the whitespace from ` @financial-times/o-test@1` to make the component name valid.\"'
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

				await createCssBundle(request, response);

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
					'Origami Build Service returned an error: \"The components query parameter contains component names which have whitespace at either the start of end of their name. Remove the whitespace from `o-test@1 ` to make the component name valid.\"'
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

				await createCssBundle(request, response);

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
					'Origami Build Service returned an error: \"The bundle request contains o-test with no version range, a version range is required Please refer to Origami Build Service v3 documentation for what is a valid version (https://www.ft.com/__origami/service/build/v3/).\"'
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

				await createCssBundle(request, response);

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
					'Origami Build Service returned an error: \"The version 5wg in o-test@5wg is not a valid version Please refer to Origami Build Service v3 documentation for what is a valid version (https://www.ft.com/__origami/service/build/v3/).\"'
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

				await createCssBundle(request, response);

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
					'Origami Build Service returned an error: \"The components query parameter contains component names which are not valid: o-TeSt.\"'
				);
			});
		}
	);

	context(
		'when given a request with an invalid brand parameter',
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
				request.query.components = 'o-test-component@v2.2.2';
				request.query.brand = 'origami';

				await createCssBundle(request, response);

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

				proclaim.include(
					bundle,
					'The brand query parameter must be either'
				);
			});
		}
	);
	context(
		'when given a request without a brand parameter',
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
				request.query.components = 'o-test-component@v2.2.2';

				await createCssBundle(request, response);

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

				proclaim.include(
					bundle,
					'The brand query parameter must be a string'
				);
			});
		}
	);
	context(
		'when given a request without a system_code parameter',
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
				request.query.components = 'o-test-component@v2.2.2';
				request.query.brand = 'master';

				await createCssBundle(request, response);

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
					'Origami Build Service returned an error: \"The system_code query parameter must be a string.\"'
				);
			});
		}
	);
	context(
		'when given a request with a placeholder system_code parameter',
		async () => {
			it('it responds with css', async () => {
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
				request.query.components = 'o-test-component@v2.2.2';
				request.query.brand = 'master';
				request.query.system_code = '$$$-no-bizops-system-code-$$$';

				await createCssBundle(request, response);

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/css; charset=UTF-8'
				);
				proclaim.deepStrictEqual(response.statusCode, 200);
			});
		}
	);
	context(
		'when given a request with an invalid system_code parameter',
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
				request.query.components = 'o-test-component@v2.2.2';
				request.query.brand = 'master';
				request.query.system_code = '$$origami!';

				await createCssBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: \"The system_code query parameter must be a valid Biz-Ops System Code.\"'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

			});
		}
	);
});
