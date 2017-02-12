'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe.only('lib/middleware/requireModulesParameter', () => {
	let express;
	let httpError;
	let requireModulesParameter;

	beforeEach(() => {
		express = require('../../mock/express.mock');

		httpError = require('../../mock/http-errors.mock');
		mockery.registerMock('http-errors', httpError);

		requireModulesParameter = require('../../../../lib/middleware/requireModulesParameter');
	});

	it('exports a function', () => {
		assert.isFunction(requireModulesParameter);
	});

	describe('requireModulesParameter()', () => {
		let middleware;

		beforeEach(() => {
			middleware = requireModulesParameter();
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;

			beforeEach(() => {
				next = sinon.spy();
				express.mockRequest.query.modules = 'test';
				middleware(express.mockRequest, express.mockResponse, next);
			});

			it('calls `next` with no error', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

			describe('when the `modules` query parameter is missing', () => {

				beforeEach(() => {
					next.reset();
					httpError.reset();
					delete express.mockRequest.query.modules;
					middleware(express.mockRequest, express.mockResponse, next);
				});

				it('creates a 400 HTTP error with a descriptive message', () => {
					assert.calledOnce(httpError);
					assert.calledWithExactly(httpError, 400, 'The modules parameter is required and must be a comma-separated list of modules');
				});

				it('calls `next` with the created error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, httpError.mockError);
				});

			});

			describe('when the `modules` query parameter is an empty string', () => {

				beforeEach(() => {
					next.reset();
					httpError.reset();
					express.mockRequest.query.modules = '';
					middleware(express.mockRequest, express.mockResponse, next);
				});

				it('creates a 400 HTTP error with a descriptive message', () => {
					assert.calledOnce(httpError);
					assert.calledWithExactly(httpError, 400, 'The modules parameter is required and must be a comma-separated list of modules');
				});

				it('calls `next` with the created error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, httpError.mockError);
				});

			});

		});

	});

});
