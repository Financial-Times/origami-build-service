'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/outputDemo', function() {
	let bundler;
	let cacheControlHeaderFromExpiry;
	let CompileError;
	let fileproxy;
	let HttpError;
	let installationmanager;
	let metrics;
	let ModuleSet;
	let outputDemo;

	beforeEach(() => {
		bundler = require('../../mock/bundler.mock');
		mockery.registerMock('../bundler', bundler);

		cacheControlHeaderFromExpiry = require('../../mock/cacheControlHeaderFromExpiry.mock');
		mockery.registerMock('../utils/cacheControlHeaderFromExpiry', cacheControlHeaderFromExpiry);

		CompileError = require('../../mock/compileerror.mock');
		mockery.registerMock('../utils/compileerror', CompileError);

		fileproxy = require('../../mock/fileproxy.mock');
		mockery.registerMock('../fileproxy', fileproxy);

		HttpError = require('../../mock/httperror.mock');
		mockery.registerMock('../express/httperror', HttpError);

		installationmanager = require('../../mock/installationmanager.mock');
		mockery.registerMock('../installationmanager', installationmanager);

		metrics = require('../../mock/metrics.mock');
		mockery.registerMock('../monitoring/metrics', metrics);

		ModuleSet = require('../../mock/moduleset.mock');
		mockery.registerMock('../moduleset', ModuleSet);

		outputDemo = require('../../../../lib/middleware/outputDemo');
	});

	it('exports a function', () => {
		assert.isFunction(outputDemo);
	});

	describe('outputDemo(config)', () => {
		let config;
		let middleware;

		beforeEach(() => {
			config = {
				tempdir: '/tmp'
			};
			middleware = outputDemo(config);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;
			let response;
			let request;

			beforeEach(() => {

				next = sinon.spy();
				response = require('../../mock/express.mock').mockResponse;
				request = require('../../mock/express.mock').mockRequest;

											});

			describe('errors', function () {
				this.timeout(30 * 1000);

				beforeEach(() => {
					bundler.getBundle.resolves(new Promise(resolve =>
						setTimeout(resolve, 22 * 1000)
					));
				});

				describe('when bundle takes more than 20 seconds', () => {
					it('returns a 307, redirecting to itself', () => {
						bundler.getBundle.resolves(new Promise(resolve =>
							setTimeout(resolve, 22 * 1000)
						));

						return middleware(request, response, next)
						.then(() => {
							assert.calledOnce(response.redirect);
							assert.equal(request.query.redirects, 1);
							assert.calledWithExactly(response.redirect, 307, '/?redirects=1');
						});
					});
				});

				describe('when a redirected bundle takes more than 20 seconds', () => {
					it('returns a 307, redirecting to itself', () => {
						request.query.redirects = 1;

						return middleware(request, response, next)
						.then(() => {
							assert.calledOnce(response.redirect);
							assert.equal(request.query.redirects, 2);
							assert.calledWithExactly(response.redirect, 307, '/?redirects=2');
						});
					});
				});

				describe('when a second-time redirected bundle takes more than 20 seconds', () => {
					it('returns a 307, redirecting to itself', () => {
						request.query.redirects = 2;

						return middleware(request, response, next)
						.then(() => {
							assert.calledOnce(response.redirect);
							assert.equal(request.query.redirects, 3);
							assert.calledWithExactly(response.redirect, 307, '/?redirects=3');
						});
					});
				});

				describe('when a third-time redirected bundle takes more than 20 seconds', () => {
					it('returns a Compile Error', () => {
						request.query.redirects = 3;
						return middleware(request, response, next)
						.then(() => {
							assert.calledOnce(next);
							assert.calledWithExactly(next, CompileError.mockInstance);
						});
					});
				});

				describe('when a bundle has an error', () => {
					let error;

					beforeEach(() => {
						error = new Error();
						bundler.getBundle.rejects(error);
					});

					it('passes the error into `next`', () => {
						return middleware(request, response, next)
						.then(() => {
							assert.calledOnce(next);
							assert.calledWithExactly(next, error);
						});
					});
				});
			});

			describe('builds', () => {
				describe('if build has a redirect query parameter', () => {
					beforeEach(() => {
						bundler.getBundle.resolves();
					});

					it('redirects to same URL without the redirect paramater', () => {
						request.query.redirects = 1;

						return middleware(request, response, next)
						.then(() => {
							assert.calledOnce(response.redirect);
							assert.calledWithExactly(response.redirect, 307, '/');
						});
					});
				});

				describe('returning built demo', () => {
					let bundle;

					beforeEach(() => {
						bundle = {
							mimeType: 'text/html',
							createdTime: new Date,
							expiryTime: Date.now() + 10000
						};
						bundler.getBundle.resolves(bundle);
						cacheControlHeaderFromExpiry.returnsArg(0);
					});

					it('uses files mimetype as the content-type of the response', () => {
						return middleware(request, response, next)
							.then(() => {
								assert.equal(response.set.firstCall.args[0]['Content-Type'], bundle.mimeType);
							});
					});

					it('uses files createdTime as the last-modified time of the response', () => {
						return middleware(request, response, next)
							.then(() => {
								assert.equal(response.set.firstCall.args[0]['Last-Modified'], bundle.createdTime.toUTCString());
							});
					});

					it('uses files expiry-time as the cache-control of the response', () => {
						return middleware(request, response, next)
							.then(() => {
								assert.equal(response.set.firstCall.args[0]['Cache-Control'], bundle.expiryTime);
							});
					});
				});
			});

		});

	});

});
