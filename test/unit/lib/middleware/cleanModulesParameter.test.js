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

		describe('middleware(request, response, spyNext)', () => {
			const spyNext = sinon.spy();

			afterEach(() => {
				spyNext.reset();
				httpError.reset();
			});

			[
				'-invalid1',
				'invalid2.@*',
				'invalid3..@*',
				'invalid4---@*',
				'.-invalid5@*',
				'inv-.alid6@*',
				'../../../../test',
				'-invalid1,invalid2.@*',
				'a'.repeat(51)
			].forEach((value) => {
				describe(`when the 'modules' query string is invalid, containing the value '${value}'`, () => {

					beforeEach(() => {
						origamiService.mockRequest.query.modules = `valid1,Valid2@^3.0.1,${value},valid3@~2.x,${'l'.repeat(50)}`;
						middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
					});

					it('creates a 400 HTTP error with a descriptive message', () => {
						assert.calledOnce(httpError);
						const expectedModuleString = value
							.split(',')
							.map((value) => value.split('@')[0])
                            .join(', ');
						assert.calledWithExactly(httpError, 400, `The modules parameter contains module names which are not valid: ${expectedModuleString}`);
					});

					it('calls `next` with the created error', () => {
						assert.calledOnce(spyNext);
						assert.calledWithExactly(spyNext, httpError.mockError);
					});
				});
			});

			describe('when the `modules` query parameter is missing', () => {

				beforeEach(() => {
					delete origamiService.mockRequest.query.modules;
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});

				it('calls `next`', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext);
				});

				it('does not modify request.query.modules', () => {
					assert.isUndefined(origamiService.mockRequest.query.modules);
				});
			});

			describe('when the `modules` query parameter is an empty string', () => {

				beforeEach(() => {
					origamiService.mockRequest.query.modules = '';
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});

				it('calls `next`', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext);
				});

				it('does not modify request.query.modules', () => {
					assert.strictEqual(origamiService.mockRequest.query.modules, '');
				});
			});

		});

	});

});
