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
							npmRegistryURL: 'https://origami-npm-registry-prototype.herokuapp.com'
						}
					}
				};
			request.query.modules = '@financial-times/o-normalise@100.0.0-13';
			request.query.brand = 'master';
			request.query.system_code = 'origami';

			await createCssBundle(request, response);

			const bundle = response._getData();

			proclaim.deepStrictEqual(
				bundle,
				'html,body{margin:0;text-rendering:optimizeLegibility;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}@media(prefers-reduced-motion: reduce){html *,html *:before,html *:after,body *,body *:before,body *:after{animation-duration:.001s !important;transition-duration:.001s !important;animation-iteration-count:1 !important}}main{display:block}body:not(.js-focus-visible) :focus,html:not(.js-focus-visible) :focus{outline:2px solid #807973}body:not(.js-focus-visible) input:focus,body:not(.js-focus-visible) textarea:focus,body:not(.js-focus-visible) select:focus,html:not(.js-focus-visible) input:focus,html:not(.js-focus-visible) textarea:focus,html:not(.js-focus-visible) select:focus{box-shadow:0 0 0 1px #807973}body.js-focus-visible .focus-visible,html.js-focus-visible .focus-visible{outline:2px solid #807973}body.js-focus-visible input.focus-visible,body.js-focus-visible textarea.focus-visible,body.js-focus-visible select.focus-visible,html.js-focus-visible input.focus-visible,html.js-focus-visible textarea.focus-visible,html.js-focus-visible select.focus-visible{box-shadow:0 0 0 1px #807973}body.js-focus-visible :focus:not(.focus-visible),html.js-focus-visible :focus:not(.focus-visible){outline:0}:focus-visible,body:not(.js-focus-visible) :focus,html:not(.js-focus-visible) :focus{outline:unset}:focus-visible,body:not(.js-focus-visible) input:focus,html:not(.js-focus-visible) input:focus,body:not(.js-focus-visible) textarea:focus,html:not(.js-focus-visible) textarea:focus,body:not(.js-focus-visible) select:focus,html:not(.js-focus-visible) select:focus{box-shadow:unset}:focus-visible{outline:2px solid #807973}input:focus-visible,textarea:focus-visible,select:focus-visible{box-shadow:0 0 0 1px #807973}html:focus,body:focus,[readonly]:focus{outline:none}a{background-color:transparent}a:active,a:hover{outline-width:0}abbr[title]{border-bottom:0;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:inherit}b,strong{font-weight:bolder}dfn{font-style:italic}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-0.25em}sup{top:-0.5em}img{border-style:none}optgroup{font-weight:bold}button,input,select{overflow:visible}button,input,select,textarea{margin:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{cursor:pointer}[disabled]{cursor:default}button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}textarea{overflow:auto}.o-normalise-clearfix{zoom:1}.o-normalise-clearfix:before,.o-normalise-clearfix:after{content:"";display:table;display:flex}.o-normalise-clearfix:after{clear:both}.o-normalise-visually-hidden{position:absolute;clip:rect(0 0 0 0);clip-path:polygon(0 0, 0 0);margin:-1px;border:0;overflow:hidden;padding:0;width:1px;height:1px;white-space:nowrap}\n'
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
							npmRegistryURL: 'https://origami-npm-registry-prototype.herokuapp.com'
						}
					}
				};

			await createCssBundle(request, response);

			const bundle = response._getData();

			proclaim.deepStrictEqual(
				response.getHeader('content-type'),
				'text/css; charset=UTF-8'
			);
			proclaim.deepStrictEqual(
				response.getHeader('cache-control'),
				'max-age=0, must-revalidate, no-cache, no-store'
            );
            proclaim.deepStrictEqual(response.statusCode, 400);

			proclaim.deepStrictEqual(
				bundle,
				'/*"Origami Build Service returned an error: The modules query parameter can not be empty."*/'
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
							npmRegistryURL: 'https://origami-npm-registry-prototype.herokuapp.com'
						}
					}
				};
				request.query.modules = '';

				await createCssBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/css; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'/*"Origami Build Service returned an error: The modules query parameter can not be empty."*/'
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
							npmRegistryURL: 'https://origami-npm-registry-prototype.herokuapp.com'
						}
					}
				};
				request.query.modules = 'o-test@1,o-test@1';

				await createCssBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/css; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'/*"Origami Build Service returned an error: The modules query parameter contains duplicate module names."*/'
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
							npmRegistryURL: 'https://origami-npm-registry-prototype.herokuapp.com'
						}
					}
				};
				request.query.modules = 'o-test@1,,';

				await createCssBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/css; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'/*"Origami Build Service returned an error: The modules query parameter can not contain empty module names."*/'
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
							npmRegistryURL: 'https://origami-npm-registry-prototype.herokuapp.com'
						}
					}
				};
				request.query.modules = ' o-test@1';

				await createCssBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/css; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'/*"Origami Build Service returned an error: The modules query parameter contains module names which have whitespace at either the start of end of their name. Remove the whitespace from \\" o-test@1\\" to make the module name valid."*/'
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
							npmRegistryURL: 'https://origami-npm-registry-prototype.herokuapp.com'
						}
					}
				};
				request.query.modules = 'o-test@1 ';

				await createCssBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/css; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'/*"Origami Build Service returned an error: The modules query parameter contains module names which have whitespace at either the start of end of their name. Remove the whitespace from \\"o-test@1 \\" to make the module name valid."*/'
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
							npmRegistryURL: 'https://origami-npm-registry-prototype.herokuapp.com'
						}
					}
				};
				request.query.modules = 'o-test';

				await createCssBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/css; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'/*"Origami Build Service returned an error: The bundle request contains o-test with no version range, a version range is required.\\nPlease refer to TODO (build service documentation) for what is a valid version."*/'
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
							npmRegistryURL: 'https://origami-npm-registry-prototype.herokuapp.com'
						}
					}
				};
				request.query.modules = 'o-test@5wg';

				await createCssBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/css; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'/*"Origami Build Service returned an error: The version 5wg in o-test@5wg is not a valid version.\\nPlease refer to TODO (build service documentation) for what is a valid version."*/'
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
							npmRegistryURL: 'https://origami-npm-registry-prototype.herokuapp.com'
						}
					}
				};
				request.query.modules = 'o-TeSt@5';

				await createCssBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/css; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'/*"Origami Build Service returned an error: The modules query parameter contains module names which are not valid: o-TeSt."*/'
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
							npmRegistryURL: 'https://origami-npm-registry-prototype.herokuapp.com'
						}
					}
				};
				request.query.modules = '@financial-times/o-normalise@100.0.0-13';
				request.query.brand = 'origami';

				await createCssBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/css; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'/*"Origami Build Service returned an error: The brand query parameter must be either \\"master\\", \\"internal\\", or \\"whitelabel\\"."*/'
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
							npmRegistryURL: 'https://origami-npm-registry-prototype.herokuapp.com'
						}
					}
				};
				request.query.modules = '@financial-times/o-normalise@100.0.0-13';

				await createCssBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/css; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'/*"Origami Build Service returned an error: The brand query parameter must be a string. Either \\"master\\", \\"internal\\", or \\"whitelabel\\"."*/'
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
							npmRegistryURL: 'https://origami-npm-registry-prototype.herokuapp.com'
						}
					}
				};
				request.query.modules = '@financial-times/o-normalise@100.0.0-13';
				request.query.brand = 'master';

				await createCssBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/css; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'/*"Origami Build Service returned an error: The system_code query parameter must be a string."*/'
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
							npmRegistryURL: 'https://origami-npm-registry-prototype.herokuapp.com'
						}
					}
				};
				request.query.modules = '@financial-times/o-normalise@100.0.0-13';
				request.query.brand = 'master';
				request.query.system_code = '$$origami!';

				await createCssBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/css; charset=UTF-8'
					);
						proclaim.deepStrictEqual(
							bundle,
							'/*"Origami Build Service returned an error: The system_code query parameter must be a valid Biz-Ops System Code."*/'
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
