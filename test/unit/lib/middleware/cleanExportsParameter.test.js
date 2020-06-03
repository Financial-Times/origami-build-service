'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/cleanExportsParameter', () => {
	let httpError;
	let origamiService;
	let cleanExportsParameter;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');

		httpError = require('../../mock/http-errors.mock');
		mockery.registerMock('http-errors', httpError);

		cleanExportsParameter = require('../../../../lib/middleware/cleanExportsParameter');
	});

	it('exports a function', () => {
		assert.isFunction(cleanExportsParameter);
	});

	describe('cleanExportsParameter()', () => {
		let middleware;

		beforeEach(() => {
			middleware = cleanExportsParameter();
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
				'%27];alert(%27ha%27)//',
				'\']',
				'abc"',
				'invalid4---@*',
				'.-invalid5@*',
			].forEach((value) => {
				describe(`when the 'export' query string is invalid, containing the value '${value}'`, () => {

					beforeEach(() => {
						origamiService.mockRequest.query.export = value;
						middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
					});

					it('creates a 400 HTTP error with a descriptive message', () => {
						assert.calledOnce(httpError);
						assert.calledWithExactly(httpError, 400, `The export parameter can only contain underscore, period, and alphanumeric characters. The export parameter given was: ${value}`);
					});

					it('calls `next` with the created error', () => {
						assert.calledOnce(spyNext);
						assert.calledWithExactly(spyNext, httpError.mockError);
					});
				});
			});

			[
				'origami',
				'a',
				'abc',
				'valid4',
				'valid_5',
			].forEach((value) => {
				describe(`when the 'export' query string is valid, containing the value '${value}'`, () => {

					beforeEach(() => {
						origamiService.mockRequest.query.export = value;
						middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
					});

					it('calls `next`', () => {
						assert.calledOnce(spyNext);
						assert.calledWithExactly(spyNext);
					});

					it('does not modify request.query.export', () => {
						assert.strictEqual(origamiService.mockRequest.query.export, value);
					});
				});
			});

			describe('when the `export` query parameter is missing', () => {

				beforeEach(() => {
					delete origamiService.mockRequest.query.export;
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});

				it('calls `next`', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext);
				});

				it('does not modify request.query.export', () => {
					assert.isUndefined(origamiService.mockRequest.query.export);
				});
			});

			describe('when the `export` query parameter is an empty string', () => {

				beforeEach(() => {
					origamiService.mockRequest.query.export = '';
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});

				it('calls `next`', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext);
				});

				it('does not modify request.query.export', () => {
					assert.strictEqual(origamiService.mockRequest.query.export, '');
				});
			});

		});

	});

});
