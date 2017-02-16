'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/outputModuleMetadata', function () {
	let bundler;
	let cacheControlHeaderFromExpiry;
	let installationmanager;
	let metrics;
	let ModuleMetadata;
	let outputModuleMetadata;

	beforeEach(() => {
		bundler = require('../../mock/bundler.mock');
		mockery.registerMock('../bundler', bundler);

		cacheControlHeaderFromExpiry = require('../../mock/cacheControlHeaderFromExpiry.mock');
		mockery.registerMock('../utils/cacheControlHeaderFromExpiry', cacheControlHeaderFromExpiry);

		installationmanager = require('../../mock/installationmanager.mock');
		mockery.registerMock('../installationmanager', installationmanager);

		metrics = require('../../mock/metrics.mock');
		mockery.registerMock('../monitoring/metrics', metrics);

		ModuleMetadata = require('../../mock/ModuleMetadata.mock');
		mockery.registerMock('../modulemetadata', ModuleMetadata);

		outputModuleMetadata = require('../../../../lib/middleware/outputModuleMetadata');
	});

	it('exports a function', () => {
		assert.isFunction(outputModuleMetadata);
	});

	describe('outputModuleMetadata(config)', () => {
		let config;
		let middleware;

		beforeEach(() => {
			config = {
				params: {
					module: 'test'
				}
			};
			middleware = outputModuleMetadata(config);
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
				describe('when moduleMetadata.getContent has an error', () => {
					let error;

					beforeEach(() => {
						error = new Error();
						ModuleMetadata.getContent.rejects(error);
					});

					it('passes the error into `next`', () => {
						return middleware(request, response, next)
							.then(() => {
								assert.calledOnce(next);
								assert.calledWithExactly(next, error);
							});
					});
				});

				describe('when response haeders have already been sent', () => {
					beforeEach(() => {
						response.headersSent = true;
						ModuleMetadata.getContent.resolves();
					});

					it('calls `next` with an error', () => {
						return middleware(request, response, next)
							.then(() => {
								assert.calledOnce(next);
								assert.equal(next.firstCall.args[0].message, 'successful metadata response after headers written?');
							});
					});
				});
			});

			describe('returning module metadata', () => {
				let content;
				let createdTime;
				let expiryTime;
				beforeEach(() => {
					createdTime = new Date();
					expiryTime = Date.now() + 10000;
					content = {
						mimeType: 'text/html',
						createdTime,
						expiryTime
					};
					ModuleMetadata.getContent.resolves(content);
					cacheControlHeaderFromExpiry.returnsArg(0);
				});

				it('returns a 200 response', () => {
					return middleware(request, response, next)
						.then(() => {
							assert.equal(response.writeHead.firstCall.args[0], 200);
						});
				});

				it('uses utf-8 json as the content-type of the response', () => {
					delete content.expiryTime;
					ModuleMetadata.getContent.resolves(content);
					delete content.createdTime;
					ModuleMetadata.getContent.resolves(content);
					return middleware(request, response, next)
						.then(() => {
							assert.equal(response.writeHead.firstCall.args[1]['Content-Type'], 'application/json;charset=UTF-8');
						});
				});

				it('uses files createdTime as the last-modified time of the response', () => {
					return middleware(request, response, next)
						.then(() => {
							assert.equal(response.writeHead.firstCall.args[1]['Last-Modified'], createdTime.toUTCString());
						});
				});

				it('uses files expiry-time as the cache-control of the response', () => {
					return middleware(request, response, next)
						.then(() => {
							assert.equal(response.writeHead.firstCall.args[1]['Cache-Control'], expiryTime);
						});
				});

				it('returns a json stringified version of the metadata, with the createdTime and expiryTime properties removed omitted', () => {
					return middleware(request, response, next)
						.then(() => {
							assert.equal(response.end.firstCall.args[0], JSON.stringify(content, undefined, 1));
						});
				});
			});
		});

	});

});
