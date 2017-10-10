'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/cleanModulesParameter', () => {
	let httpError;
	let origamiService;
	let cleanModulesParameter;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');

		httpError = require('../../mock/http-errors.mock');
		mockery.registerMock('http-errors', httpError);

		cleanModulesParameter = require('../../../../lib/middleware/cleanModulesParameter');
	});

	it('exports a function', () => {
		assert.isFunction(cleanModulesParameter);
	});

	describe('cleanModulesParameter()', () => {
		let middleware;

		beforeEach(() => {
			middleware = cleanModulesParameter();
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;

			beforeEach(() => {
				next = sinon.spy();
				origamiService.mockRequest.query.modules = 'valid1,Valid2@^3.0.1,-invalid1,valid3@~2.x,invalid2.@*,../../../../test';
				middleware(origamiService.mockRequest, origamiService.mockResponse, next);
			});

			it('creates a 400 HTTP error with a descriptive message', () => {
				assert.calledOnce(httpError);
				assert.calledWithExactly(httpError, 400, 'The modules parameter contains module names which are not valid: -invalid1, invalid2., ../../../../test');
			});

			it('calls `next` with the created error', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next, httpError.mockError);
			});

			describe('when the `modules` query parameter is missing', () => {

				beforeEach(() => {
					next.reset();
					httpError.reset();
					delete origamiService.mockRequest.query.modules;
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('calls `next`', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

				it('does not modify request.query.modules', () => {
					assert.isUndefined(origamiService.mockRequest.query.modules);
				});
			});

			describe('when the `modules` query parameter is an empty string', () => {

				beforeEach(() => {
					next.reset();
					httpError.reset();
					origamiService.mockRequest.query.modules = '';
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('calls `next`', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

				it('does not modify request.query.modules', () => {
					assert.strictEqual(origamiService.mockRequest.query.modules, '');
				});
			});

		});

	});

});
