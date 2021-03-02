
'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/cleanSourceParameter', () => {
	let httpError;
	let origamiService;
	let cleanSourceParameter;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');

		httpError = require('../../mock/http-errors.mock');
		mockery.registerMock('http-errors', httpError);

		cleanSourceParameter = require('../../../../lib/middleware/cleanSourceParameter');
	});

	it('exports a function', () => {
		assert.isFunction(cleanSourceParameter);
	});

	describe('cleanSourceParameter()', () => {
		let middleware;

		beforeEach(() => {
			middleware = cleanSourceParameter();
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, spyNext)', () => {
			const spyNext = sinon.spy();

			afterEach(() => {
				spyNext.reset();
				httpError.reset();
			});

			[
				'really-long-invalid-really-long-invalid-really-long-invalid-really-long-invalid-really-long-invalid-really-long-invalid-',
				' ',
				'in_valid',
				'inv@lid2',
				'inva.lid3',
			].forEach((value) => {
				describe(`when the 'source' query string is invalid, containing the value '${value}'`, () => {

					beforeEach(() => {
						origamiService.mockRequest.query.source = value;
						middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
					});

					it('creates a 400 HTTP error', () => {
						assert.calledOnce(httpError);
						assert.calledWithExactly(httpError, 400, 'The "source" parameter must be a valid system code, according to v1.3 of the system code spec.');
					});

					it('calls `next` with the created error', () => {
						assert.calledOnce(spyNext);
						assert.calledWithExactly(spyNext, httpError.mockError);
					});
				});
			});

			describe('when the `source` query parameter is missing', () => {

				beforeEach(() => {
					delete origamiService.mockRequest.query.source;
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});

				it('calls `next`', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext);
				});

				it('sets request.query.source to "build-service"', () => {
					assert.equal(origamiService.mockRequest.query.source, 'build-service');
				});
			});

			describe('when the `source` query parameter is valid', () => {

				const testSourceName = 'a-valid-source-123';

				beforeEach(() => {
					origamiService.mockRequest.query.source = testSourceName;
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});

				it('calls `next`', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext);
				});

				it('does not modify request.query.source', () => {
					assert.strictEqual(origamiService.mockRequest.query.source, testSourceName);
				});
			});

		});

	});

});
