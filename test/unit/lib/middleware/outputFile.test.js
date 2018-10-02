'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/outputFile', () => {
	let cacheControlHeaderFromExpiry;
	let fileproxy;
	let HttpError;
	let installationmanager;
	let origamiService;
	let outputFile;

	beforeEach(() => {
		cacheControlHeaderFromExpiry = require('../../mock/cacheControlHeaderFromExpiry.mock');
		mockery.registerMock('../utils/cacheControlHeaderFromExpiry', cacheControlHeaderFromExpiry);

		fileproxy = require('../../mock/fileproxy.mock');
		mockery.registerMock('../fileproxy', fileproxy);

		HttpError = require('../../mock/httperror.mock');
		mockery.registerMock('../express/httperror', HttpError);

		installationmanager = require('../../mock/installationmanager.mock');
		mockery.registerMock('../installationmanager', installationmanager);

		origamiService = require('../../mock/origami-service.mock');

		outputFile = require('../../../../lib/middleware/outputFile');
	});

	it('exports a function', () => {
		assert.isFunction(outputFile);
	});

	describe('outputFile(app)', () => {
		let middleware;

		beforeEach(() => {
			origamiService.mockApp.ft.options.tempdir = '/tmp';
			origamiService.mockApp.ft.options.registry = {};
			middleware = outputFile(origamiService.mockApp);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;
			let response;
			let request;

			const fileinfo = {
				mimeType: 'text/html',
				mtime: new Date(),
				expiryTime: Date.now() + 10000,
				size: 500
			};

			beforeEach(() => {

				next = sinon.spy();
				response = origamiService.mockResponse;
				request = origamiService.mockRequest;

				cacheControlHeaderFromExpiry.returnsArg(0);

				fileproxy.mockFileproxy.getFileInfo.resolves(fileinfo);

				fileproxy.mockFileproxy.getContent.resolves({
					length: fileinfo.size
				});

			});

			it('uses files mimetype as the content-type of the response', () => {
				return middleware(request, response, next)
					.then(() => {
						assert.equal(response.writeHead.firstCall.args[1]['Content-Type'], fileinfo.mimeType);
					});
			});

			it('uses files mtime as the last-modified time of the response', () => {
				return middleware(request, response, next)
					.then(() => {
						assert.equal(response.writeHead.firstCall.args[1]['Last-Modified'], fileinfo.mtime.toUTCString());
					});
			});

			it('uses files expiry-time as the cache-control of the response', () => {
				return middleware(request, response, next)
					.then(() => {
						assert.equal(response.writeHead.firstCall.args[1]['Cache-Control'], fileinfo.expiryTime);
					});
			});

			it('sets access-control-allow-origin to allow all origins', () => {
				return middleware(request, response, next)
					.then(() => {
						assert.equal(response.writeHead.firstCall.args[1]['Access-Control-Allow-Origin'], '*');
					});
			});

			describe('when hit via a HEAD request', () => {

				it('returns a 200 response with no body and all the headers', () => {
					request.method = 'HEAD';
					return middleware(request, response, next)
						.then(() => {
							assert.calledOnce(response.writeHead);

							assert.calledWithExactly(response.writeHead, 200, {
								'Content-Type': fileinfo.mimeType,
								'Last-Modified': fileinfo.mtime.toUTCString(),
								'Cache-Control': fileinfo.expiryTime,
								'Access-Control-Allow-Origin': '*',
							});

							assert.calledOnce(response.end);
						});
				});
			});

			describe('when request has an if-modified-since header', () => {

				describe('which is the same as the files mtime', () => {

					it('returns a 304 response with no body and all the headers', () => {
						request.method = 'GET';
						request.headers['if-modified-since'] = fileinfo.mtime.toUTCString();
						return middleware(request, response, next)
							.then(() => {
								assert.calledOnce(response.writeHead);

								assert.calledWith(response.writeHead, 304);

								assert.calledWithExactly(response.writeHead, 304, {
									'Content-Type': fileinfo.mimeType,
									'Last-Modified': fileinfo.mtime.toUTCString(),
									'Cache-Control': fileinfo.expiryTime,
									'Access-Control-Allow-Origin': '*',
								});

								assert.calledOnce(response.end);
							});
					});
				});

				describe('which is different to the files mtime', () => {

					it('returns a 304 response with no body and all the headers', () => {
						request.method = 'GET';
						request.headers['if-modified-since'] = 11111;
						return middleware(request, response, next)
							.then(() => {
								response.writeHead.firstCall.notCalledWith(304);
							});
					});
				});
			});


			describe('when file requested is text/html and more than 5000000', () => {
				it('sets content-length to length of file', () => {
					fileinfo.size = 5000001;
					return middleware(request, response, next)
						.then(() => {
							assert.calledOnce(response.writeHead);

							assert.calledWithExactly(response.writeHead, 200, {
								'Content-Type': fileinfo.mimeType,
								'Last-Modified': fileinfo.mtime.toUTCString(),
								'Cache-Control': fileinfo.expiryTime,
								'Access-Control-Allow-Origin': '*',
								'Content-Length': fileinfo.size
							});
						});
				});
			});

			describe('when fileproxy.getFileInfo throws a generic error', () => {
				let getFileInfoError;

				beforeEach(() => {
					next.reset();
					getFileInfoError = new Error('Generic error.');
					getFileInfoError.code = 123;
					fileproxy.mockFileproxy.getFileInfo.rejects(getFileInfoError);
					request.originalUrl = '';
					return middleware(request, response, next);
				});

				it('wraps the error calls `next` with the wrapped error', () => {
					assert.calledOnce(next);
					assert.equal(next.firstCall.args[0].message, 'Can\'t get info about file from URL \'\': Generic error.');
					assert.deepEqual(next.firstCall.args[0].parentError, getFileInfoError);
					assert.equal(next.firstCall.args[0].code, 123);
				});

			});

			describe('when fileproxy.getFileInfo throws an HTTP error', () => {
				let getFileInfoError;

				beforeEach(() => {
					next.reset();
					getFileInfoError = new HttpError('Generic error.');
					getFileInfoError.code = 123;
					fileproxy.mockFileproxy.getFileInfo.rejects(getFileInfoError);
					request.originalUrl = '';
					return middleware(request, response, next);
				});

				it('wraps the error calls `next` with the wrapped error', () => {
					assert.calledOnce(next);
					assert.deepEqual(next.firstCall.args[0], getFileInfoError);
				});

			});
		});

	});

});
