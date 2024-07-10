'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/sanitize-errors', () => {
	let CompileError;
	let origamiService;
	let sanitizeErrors;
	let UserError;

	beforeEach(() => {

		CompileError = class CompileError extends Error {
			constructor() {
				super(...arguments);
				this.type = 'CompileError';
			}
		};
		mockery.registerMock('../utils/compileerror', CompileError);

		UserError = class UserError extends Error {
			constructor() {
				super(...arguments);
				this.type = 'UserError';
			}
		};
		mockery.registerMock('../utils/usererror', UserError);

		origamiService = require('../../mock/origami-service.mock');

		sanitizeErrors = require('../../../../lib/middleware/sanitize-errors');
	});

	it('exports a function', () => {
		assert.isFunction(sanitizeErrors);
	});

	describe('sanitizeErrors()', () => {
		let middleware;

		beforeEach(() => {
			middleware = sanitizeErrors();
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(error, request, response, next)', () => {
			let error;
			let next;

			beforeEach(() => {
				error = new Error('mock error');
				next = sinon.spy();
				middleware(error, origamiService.mockRequest, origamiService.mockResponse, next);
			});

			it('calls `next` with the passed in error', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next, error);
			});

			describe('when `error.details` is defined', () => {

				beforeEach(() => {
					error.details = 'mock details';
					next.reset();
					middleware(error, origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('combines the error message and details in a new message', () => {
					assert.strictEqual(error.message, 'mock error\nmock details');
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, error);
				});

			});

			describe('when `error` is an instance of CompileError', () => {

				beforeEach(() => {
					error = new CompileError('mock compile error');
					next.reset();
					middleware(error, origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('sets the error `status` property to 560', () => {
					assert.strictEqual(error.status, 560);
				});

				it('makes the error `message` property more human-readable', () => {
					assert.strictEqual(error.message, 'Cannot complete build due to compilation error from build tools:\n\nmock compile error\n');
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, error);
				});

			});

			describe('when `error` is an instance of UserError', () => {

				beforeEach(() => {
					error = new UserError('mock user error');
					next.reset();
					middleware(error, origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('sets the error `status` property to 400', () => {
					assert.strictEqual(error.status, 400);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, error);
				});

			});

			describe('when `error.code` is ENOTFOUND', () => {

				beforeEach(() => {
					error.code = 'ENOTFOUND';
					next.reset();
					middleware(error, origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('sets the error `status` property to 404', () => {
					assert.strictEqual(error.status, 404);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, error);
				});

				describe('when `error.data` is defined', () => {

					beforeEach(() => {
						error.data = {
							foo: 'bar'
						};
						next.reset();
						middleware(error, origamiService.mockRequest, origamiService.mockResponse, next);
					});

					it('adds the data as JSON to the error message', () => {
						assert.strictEqual(error.message, 'mock error\n\n{\n  "foo": "bar"\n}');
					});

					it('calls `next` with the passed in error', () => {
						assert.calledOnce(next);
						assert.calledWithExactly(next, error);
					});

				});

			});

			describe('when `error.code` is ENOENT', () => {

				beforeEach(() => {
					error.code = 'ENOENT';
					next.reset();
					middleware(error, origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('sets the error `status` property to 404', () => {
					assert.strictEqual(error.status, 404);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, error);
				});

			});

			describe('when `error.code` is ENORESTARGET', () => {

				beforeEach(() => {
					error.code = 'ENORESTARGET';
					next.reset();
					middleware(error, origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('sets the error `status` property to 404', () => {
					assert.strictEqual(error.status, 404);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, error);
				});

			});

			describe('when `error.code` is ECONFLICT', () => {

				beforeEach(() => {
					error.code = 'ECONFLICT';
					next.reset();
					middleware(error, origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('sets the error `status` property to 409', () => {
					assert.strictEqual(error.status, 409);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, error);
				});

				describe('when `error.picks` is defined', () => {

					beforeEach(() => {
						error.picks = [
							{
								endpoint: {
									target: 'mock-endpoint-target-1'
								},
								dependants: [
									{
										pkgMeta: {
											name: '__MAIN__',
											_target: 'mock-target-1'
										}
									}
								]
							},
							{
								endpoint: {
									target: 'mock-endpoint-target-2'
								},
								dependants: [
									{
										pkgMeta: {
											name: 'foo',
											_target: 'mock-target-2'
										}
									}
								]
							}
						];
						next.reset();
						middleware(error, origamiService.mockRequest, origamiService.mockResponse, next);
					});

					it('adds the pick details to the `message` property', () => {
						assert.strictEqual(error.message, [
							'Cannot complete build: conflicting dependencies exist.',
							'',
							'mock error',
							' - Required at version mock-endpoint-target-1 in the URL',
							' - Required at version mock-endpoint-target-2 by foo@mock-target-2'
						].join('\n'));
					});

					it('calls `next` with the passed in error', () => {
						assert.calledOnce(next);
						assert.calledWithExactly(next, error);
					});

				});

			});

			describe('when `error.code` is EREMOTEIO', () => {

				beforeEach(() => {
					error.code = 'EREMOTEIO';
					next.reset();
					middleware(error, origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('sets the error `status` property to 502', () => {
					assert.strictEqual(error.status, 502);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, error);
				});

			});

			describe('when `error.code` is EAI_AGAIN', () => {

				beforeEach(() => {
					error.code = 'EAI_AGAIN';
					next.reset();
					middleware(error, origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('sets the error `status` property to 502', () => {
					assert.strictEqual(error.status, 502);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, error);
				});

			});

		});

	});

});
