'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');
const counter = require('../../../../lib/middleware/createCounter');

const proxyquire = require('proxyquire');

describe('lib/middleware/sanitize-errors', () => {
	let CompileError;
	let metrics;
	let origamiService;
	let sanitizeErrors;
	let createCounterStub;
	let sandbox;

	let UserError;

	afterEach(() => {
		sandbox.restore();
	})

	beforeEach(() => {
		sandbox = sinon.createSandbox();
		createCounterStub = sandbox.stub(counter, 'createCounter');
		createCounterStub.returns({add: sandbox.stub()});
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

		sanitizeErrors = proxyquire('../../../../lib/middleware/sanitize-errors', {
			'./createCounter': { createCounter: createCounterStub }
		});
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
			let nextSpy;

			beforeEach(() => {
				nextSpy = sandbox.spy();
				error = new Error('mock error');
			});

			describe('given a generic error', () => {
				beforeEach(() => {
					createCounterStub.returns({add: sandbox.stub()});
					nextSpy.resetHistory();
					middleware(
						error,
						origamiService.mockRequest,
						origamiService.mockResponse,
						nextSpy
					);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(nextSpy);
					assert.calledWithExactly(nextSpy, error);
				});
			})


			describe('when `error.details` is defined', () => {
				beforeEach(() => {
					error.details = 'mock details';
					nextSpy.resetHistory();
					middleware(
						error,
						origamiService.mockRequest,
						origamiService.mockResponse,
						nextSpy
					);
				});

				it('combines the error message and details in a new message', () => {
					assert.strictEqual(error.message, 'mock error\nmock details');
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(nextSpy);
					assert.calledWithExactly(nextSpy, error);
				});
			});

			describe('when `error` is an instance of CompileError', () => {
				let addSpy;

				beforeEach(() => {
					addSpy = sandbox.spy()
					createCounterStub.withArgs(sinon.match.any, 'servererrors.compile').returns({add: addSpy})

					error = new CompileError('mock compile error');
					middleware(
						error,
						origamiService.mockRequest,
						origamiService.mockResponse,
						nextSpy
					);
				});

				afterEach(() => {
					addSpy.resetHistory();
				})

				it('increments the `servererrors.compile` metric', () => {
					assert.calledOnce(addSpy);
					assert.calledWithExactly(addSpy, 1);
				});

				it('sets the error `status` property to 560', () => {
					assert.strictEqual(error.status, 560);
				});

				it('makes the error `message` property more human-readable', () => {
					assert.strictEqual(
						error.message,
						'Cannot complete build due to compilation error from build tools:\n\nmock compile error\n'
					);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(nextSpy);
					assert.calledWithExactly(nextSpy, error);
				});
			});

			describe('when `error` is an instance of UserError', () => {
				beforeEach(() => {
					createCounterStub.returns({add: sandbox.stub()});
					error = new UserError('mock user error');
					middleware(
						error,
						origamiService.mockRequest,
						origamiService.mockResponse,
						nextSpy
					);
				});

				it('sets the error `status` property to 400', () => {
					assert.strictEqual(error.status, 400);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(nextSpy);
					assert.calledWithExactly(nextSpy, error);
				});
			});

			describe('when `error.code` is ENOTFOUND', () => {
				beforeEach(() => {
					createCounterStub.returns({add: sandbox.stub()});
					error.code = 'ENOTFOUND';
					middleware(
						error,
						origamiService.mockRequest,
						origamiService.mockResponse,
						nextSpy
					);
				});

				it('sets the error `status` property to 404', () => {
					assert.strictEqual(error.status, 404);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(nextSpy);
					assert.calledWithExactly(nextSpy, error);
				});

				describe('when `error.data` is defined', () => {
					beforeEach(() => {
						nextSpy.resetHistory();
						createCounterStub.returns({add: sandbox.stub()});
						error.data = {
							foo: 'bar',
						};
						middleware(
							error,
							origamiService.mockRequest,
							origamiService.mockResponse,
							nextSpy
						);
					});

					it('adds the data as JSON to the error message', () => {
						assert.strictEqual(
							error.message,
							'mock error\n\n{\n  "foo": "bar"\n}'
						);
					});

					it('calls `next` with the passed in error', () => {
						assert.calledOnce(nextSpy);
						assert.calledWithExactly(nextSpy, error);
					});
				});
			});

			describe('when `error.code` is ENOENT', () => {
				beforeEach(() => {
					nextSpy.resetHistory();
					createCounterStub.returns({add: sandbox.stub()});
					error.code = 'ENOENT';
					middleware(
						error,
						origamiService.mockRequest,
						origamiService.mockResponse,
						nextSpy
					);
				});

				it('sets the error `status` property to 404', () => {
					assert.strictEqual(error.status, 404);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(nextSpy);
					assert.calledWithExactly(nextSpy, error);
				});
			});

			describe('when `error.code` is ENORESTARGET', () => {
				beforeEach(() => {
					createCounterStub.returns({add: sandbox.stub()});
					error.code = 'ENORESTARGET';
					middleware(
						error,
						origamiService.mockRequest,
						origamiService.mockResponse,
						nextSpy
					);
				});

				it('sets the error `status` property to 404', () => {
					assert.strictEqual(error.status, 404);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(nextSpy);
					assert.calledWithExactly(nextSpy, error);
				});
			});

			describe('when `error.code` is ECONFLICT', () => {
				let addSpy;

				beforeEach(() => {
					addSpy = sandbox.spy()
					createCounterStub.withArgs(sinon.match.any, 'usererrors.conflict').returns({add: addSpy})

					error.code = 'ECONFLICT';
					middleware(
						error,
						origamiService.mockRequest,
						origamiService.mockResponse,
						nextSpy
					);
				});

				it('increments the `usererrors.conflict` metric', () => {
					assert.calledOnce(addSpy);
					assert.calledWithExactly(addSpy, 1);
				});

				it('sets the error `status` property to 409', () => {
					assert.strictEqual(error.status, 409);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(nextSpy);
					assert.calledWithExactly(nextSpy, error);
				});

				describe('when `error.picks` is defined', () => {
					beforeEach(() => {
						createCounterStub.returns({add: sandbox.stub()});
						nextSpy.resetHistory();
						error.picks = [
							{
								endpoint: {
									target: 'mock-endpoint-target-1',
								},
								dependants: [
									{
										pkgMeta: {
											name: '__MAIN__',
											_target: 'mock-target-1',
										},
									},
								],
							},
							{
								endpoint: {
									target: 'mock-endpoint-target-2',
								},
								dependants: [
									{
										pkgMeta: {
											name: 'foo',
											_target: 'mock-target-2',
										},
									},
								],
							},
						];
						middleware(
							error,
							origamiService.mockRequest,
							origamiService.mockResponse,
							nextSpy
						);
					});

					it('adds the pick details to the `message` property', () => {
						assert.strictEqual(
							error.message,
							[
								'Cannot complete build: conflicting dependencies exist.',
								'',
								'mock error',
								' - Required at version mock-endpoint-target-1 in the URL',
								' - Required at version mock-endpoint-target-2 by foo@mock-target-2',
							].join('\n')
						);
					});

					it('calls `next` with the passed in error', () => {
						assert.calledOnce(nextSpy);
						assert.calledWithExactly(nextSpy, error);
					});
				});
			});

			describe('when `error.code` is EREMOTEIO', () => {
				let addSpy;
				beforeEach(() => {
					addSpy = sandbox.spy()
					createCounterStub.withArgs(sinon.match.any,'servererrors.remoteio').returns({add: addSpy})
					error.code = 'EREMOTEIO';
					middleware(
						error,
						origamiService.mockRequest,
						origamiService.mockResponse,
						nextSpy
					);
				});

				afterEach(()=>{
					addSpy.resetHistory();
				})

				it('increments the `servererrors.remoteio` metric', () => {
					assert.calledOnce(addSpy);
					assert.calledWithExactly(addSpy, 1);
				});

				it('sets the error `status` property to 502', () => {
					assert.strictEqual(error.status, 502);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(nextSpy);
					assert.calledWithExactly(nextSpy, error);
				});
			});

			describe('when `error.code` is EAI_AGAIN', () => {
				let addSpy;

				beforeEach(() => {
					addSpy = sandbox.spy()
					createCounterStub.withArgs(sinon.match.any, 'servererrors.remoteio').returns({add: addSpy})
					error.code = 'EAI_AGAIN';
					middleware(
						error,
						origamiService.mockRequest,
						origamiService.mockResponse,
						nextSpy
					);
				});

				afterEach(() =>{
					addSpy.resetHistory();
				})

				it('increments the `servererrors.remoteio` metric', () => {
					assert.calledOnce(addSpy);
					assert.calledWithExactly(addSpy, 1);
				});

				it('sets the error `status` property to 502', () => {
					assert.strictEqual(error.status, 502);
				});

				it('calls `next` with the passed in error', () => {
					assert.calledOnce(nextSpy);
					assert.calledWithExactly(nextSpy, error);
				});
			});
		});
	});
});
