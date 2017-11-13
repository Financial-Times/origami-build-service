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
	let moduleInstallation;
	let ModuleSet;
	let Registry;
	let origamiService;
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

		moduleInstallation = require('../../mock/moduleinstallation.mock')();

		ModuleSet = require('../../mock/moduleset.mock');
		mockery.registerMock('../moduleset', ModuleSet);

		Registry = require('../../mock/registry.mock');
		mockery.registerMock('../registry', Registry);

		origamiService = require('../../mock/origami-service.mock');

		outputDemo = require('../../../../lib/middleware/outputDemo');
	});

	it('exports a function', () => {
		assert.isFunction(outputDemo);
	});

	describe('outputDemo(app)', () => {
		let middleware;

		beforeEach(() => {
			origamiService.mockApp.origami.options.tempdir = '/tmp';
			middleware = outputDemo(origamiService.mockApp);

			installationmanager.createInstallation.resolves(moduleInstallation);
			moduleInstallation.listDirectNoneOrigamiComponents.resolves({});
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;
			let response;
			let request;

			beforeEach(() => {
				bundler.getBundle.resolves();
				next = sinon.spy();
				response = origamiService.mockResponse;
				request = origamiService.mockRequest;
			});

			describe('errors', () => {

				beforeEach(() => {
					// return a promise which never resolves so timeout always resolves first
					bundler.getBundle.returns(new Promise(() => {}));
					sinon.stub(global, 'setTimeout');
					global.setTimeout.callsArgWithAsync(0, 'timeout');
				});

				afterEach(() => {
					global.setTimeout.restore();
				});

				describe('when bundle takes more than 20 seconds', () => {
					it('returns a 307, redirecting to itself', () => {
						return middleware(request, response, next)
						.then(() => {
							assert.calledOnce(global.setTimeout);
							assert.strictEqual(global.setTimeout.firstCall.args[1], 20000);
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
							assert.calledOnce(global.setTimeout);
							assert.strictEqual(global.setTimeout.firstCall.args[1], 20000);
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
							assert.calledOnce(global.setTimeout);
							assert.strictEqual(global.setTimeout.firstCall.args[1], 20000);
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
							assert.calledOnce(global.setTimeout);
							assert.strictEqual(global.setTimeout.firstCall.args[1], 20000);
							assert.calledOnce(next);
							assert.calledWithExactly(next, CompileError.mockInstance);
						});
					});
				});

				describe('when a bundle has an error', () => {
					let error;

					beforeEach(() => {
						global.setTimeout.restore();
						sinon.stub(global, 'setTimeout');
						error = new Error();
						bundler.getBundle.reset().rejects(error);
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
