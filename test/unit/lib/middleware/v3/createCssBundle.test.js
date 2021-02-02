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
		it('it responds with a css bundle which contains the requested module', async () => {
			const request = httpMock.createRequest();
			const response = httpMock.createResponse();
			response.startTime = sinon.spy();
			response.endTime = sinon.spy();
			request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.com'
						}
					}
				};
			request.query.modules = '@financial-times/o-test-component@v2.0.0-beta.1';
			request.query.brand = 'master';
			request.query.system_code = 'origami';

			await createCssBundle(request, response);

			const bundle = response._getData();

			proclaim.deepStrictEqual(
				bundle,
				'.o-test-component{padding:.5em 1em;background-color:pink}.o-test-component:after{content:\'The square root of 64 is "8".\'}\n'
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

	context('when given a request with no modules parameter', function () {
		it('it responds with a css bundle which contains a comment containing an error message', async () => {
			const request = httpMock.createRequest();
			const response = httpMock.createResponse();
			response.startTime = sinon.spy();
			response.endTime = sinon.spy();
			request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.com'
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
				'Origami Build Service returned an error: \"The modules query parameter can not be empty.\"'
			);
		});
	});

	context(
		'when given a request with modules parameter as empty string',
		async () => {
			it('it responds with a css bundle which contains a comment containing an error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.com'
						}
					}
				};
				request.query.modules = '';

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
					'Origami Build Service returned an error: \"The modules query parameter can not be empty.\"'
				);
			});
		}
	);

	context(
		'when given a request with a modules parameter which contains duplicates',
		async () => {
			it('it responds with a css bundle which contains a comment containing an error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.com'
						}
					}
				};
				request.query.modules = 'o-test@1,o-test@1';

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
					'Origami Build Service returned an error: \"The modules query parameter contains duplicate module names.\"'
				);
			});
		}
	);
	context(
		'when given a request with a modules parameter which contains empty module names',
		async () => {
			it('it responds with a css bundle which contains a comment containing an error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.com'
						}
					}
				};
				request.query.modules = 'o-test@1,,';

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
					'Origami Build Service returned an error: \"The modules query parameter can not contain empty module names.\"'
				);
			});
		}
	);
	context(
		'when given a request with a modules parameter which contains a module name with whitespace at the start',
		async () => {
			it('it responds with a css bundle which contains a comment containing an error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.com'
						}
					}
				};
				request.query.modules = ' o-test@1';

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
					'Origami Build Service returned an error: \"The modules query parameter contains module names which have whitespace at either the start of end of their name. Remove the whitespace from ` o-test@1` to make the module name valid.\"'
				);
			});
		}
	);
	context(
		'when given a request with a modules parameter which contains a module name with whitespace at the end',
		async () => {
			it('it responds with a css bundle which contains a comment containing an error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.com'
						}
					}
				};
				request.query.modules = 'o-test@1 ';

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
					'Origami Build Service returned an error: \"The modules query parameter contains module names which have whitespace at either the start of end of their name. Remove the whitespace from `o-test@1 ` to make the module name valid.\"'
				);
			});
		}
	);
	context(
		'when given a request with a modules parameter which contains a module name without a version',
		async () => {
			it('it responds with a css bundle which contains a comment containing an error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.com'
						}
					}
				};
				request.query.modules = 'o-test';

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
					'Origami Build Service returned an error: \"The bundle request contains o-test with no version range, a version range is required.\\nPlease refer to TODO (build service documentation) for what is a valid version.\"'
				);
			});
		}
	);
	context(
		'when given a request with a modules parameter which contains a module name with an invalid version',
		async () => {
			it('it responds with a css bundle which contains a comment containing an error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.com'
						}
					}
				};
				request.query.modules = 'o-test@5wg';

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
					'Origami Build Service returned an error: \"The version 5wg in o-test@5wg is not a valid version.\\nPlease refer to TODO (build service documentation) for what is a valid version.\"'
				);
			});
		}
	);
	context(
		'when given a request with a modules parameter which contains a invalid module names',
		async () => {
			it('it responds with a css bundle which contains a comment containing an error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.com'
						}
					}
				};
				request.query.modules = 'o-TeSt@5';

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
					'Origami Build Service returned an error: \"The modules query parameter contains module names which are not valid: o-TeSt.\"'
				);
			});
		}
	);
	context(
		'when given a request with an invalid brand parameter',
		async () => {
			it('it responds with a css bundle which contains a comment containing an error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.com'
						}
					}
				};
				request.query.modules = '@financial-times/o-test-component@v2.0.0-beta.1';
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

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: \"The brand query parameter must be either `master`, `internal`, or `whitelabel`.\"'
				);
			});
		}
	);
	context(
		'when given a request without a brand parameter',
		async () => {
			it('it responds with a css bundle which contains a comment containing an error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.com'
						}
					}
				};
				request.query.modules = '@financial-times/o-test-component@v2.0.0-beta.1';

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
					'Origami Build Service returned an error: \"The brand query parameter must be a string. Either `master`, `internal`, or `whitelabel`.\"'
				);
			});
		}
	);
	context(
		'when given a request without a system_code parameter',
		async () => {
			it('it responds with a css bundle which contains a comment containing an error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.com'
						}
					}
				};
				request.query.modules = '@financial-times/o-test-component@v2.0.0-beta.1';
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
		'when given a request with an invalid system_code parameter',
		async () => {
			it('it responds with a css bundle which contains a comment containing an error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.com'
						}
					}
				};
				request.query.modules = '@financial-times/o-test-component@v2.0.0-beta.1';
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
