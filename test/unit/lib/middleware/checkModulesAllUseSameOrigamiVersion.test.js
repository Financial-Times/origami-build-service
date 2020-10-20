'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/checkModulesAllUseSameOrigamiVersion', () => {
	let httpError;
	let origamiService;
	let checkModulesAllUseSameOrigamiVersion;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');

		httpError = require('../../mock/http-errors.mock');
		mockery.registerMock('http-errors', httpError);

		checkModulesAllUseSameOrigamiVersion = require('../../../../lib/middleware/checkModulesAllUseSameOrigamiVersion');
	});

	it('exports a function', () => {
		assert.isFunction(checkModulesAllUseSameOrigamiVersion);
	});

	describe('checkModulesAllUseSameOrigamiVersion()', () => {
		let middleware;

		beforeEach(() => {
			middleware = checkModulesAllUseSameOrigamiVersion();
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

			describe('when the \'modules\' query string contains only modules with versions which use origami spec v1', () => {

				beforeEach(() => {
					origamiService.mockRequest.query.modules = 'o-message@^1.0.0';
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});

				it('calls `next`', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext);
				});
			});

			describe('when the \'modules\' query string contains only modules with versions which use origami spec v2', () => {

				beforeEach(() => {
					origamiService.mockRequest.query.modules = 'o-teaser@^6.0.0';
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});

				it('calls `next`', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext);
				});
			});

			describe('when the \'modules\' query string contains a module with a version range which spans across Origami spec v1 and v2 versions of the module', () => {

				beforeEach(() => {
					origamiService.mockRequest.query.modules = 'o-teaser@>=3';
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});

				it('creates a 400 HTTP error with a descriptive message', () => {
					assert.calledOnce(httpError);
					assert.calledWithExactly(httpError, 400, 'The version range >=3 for o-teaser is not allowed because it is ambiguous, it can return versions of the component which were built against different versions of the Origami Specification.');
				});

				it('calls `next` with the created error', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext, httpError.mockError);
				});
			});

			describe('when the \'modules\' query string contains modules with a git ref as the version', () => {

				beforeEach(() => {
					origamiService.mockRequest.query.modules = 'o-teaser@v3';
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});

				it('calls `next`', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext);
				});
			});

			describe('when the \'modules\' query string contains modules with a git ref as the version and another module with a spec v1 version', () => {

				beforeEach(() => {
					origamiService.mockRequest.query.modules = 'o-teaser@v3,o-message@^1';
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});

				it('calls `next`', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext);
				});
			});

			describe('when the \'modules\' query string contains modules with a git ref as the version and another module with a spec v2 version', () => {

				beforeEach(() => {
					origamiService.mockRequest.query.modules = 'o-teaser@v3,o-message@^7';
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});

				it('creates a 400 HTTP error with a descriptive message', () => {
					assert.calledOnce(httpError);
					assert.calledWithExactly(httpError, 400, 'The specific module versions being requested are of different versions of the Origami spec.\n'+
					'o-teaser@v3 is Origami version 1\n'+
					'o-message@^7 is Origami version 2');
				});

				it('calls `next` with the created error', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext, httpError.mockError);
				});
			});

			describe('when the \'modules\' query string contains a module with a git ref which has never been built with spec v1 and another module with a spec v2 version', () => {

				beforeEach(() => {
					origamiService.mockRequest.query.modules = 'o-no@v3,o-teaser@^6';
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});


				it('calls `next`', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext);
				});
			});

			describe('when the \'modules\' query string contains only a non-origami module', () => {

				beforeEach(() => {
					origamiService.mockRequest.query.modules = 'o-no@^7';
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});


				it('calls `next`', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext);
				});
			});

			describe('when the \'modules\' query string contains a non-origami module and a spec v1 origami module', () => {

				beforeEach(() => {
					origamiService.mockRequest.query.modules = 'o-no@^7,o-teaser@^3';
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});


				it('calls `next`', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext);
				});
			});

			describe('when the \'modules\' query string contains a non-origami module and a spec v2 origami module', () => {

				beforeEach(() => {
					origamiService.mockRequest.query.modules = 'o-no@^7,o-teaser@^6';
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});


				it('calls `next`', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext);
				});
			});

			describe('when the \'modules\' query string contains modules which use origami spec v1 and v2', () => {

				beforeEach(() => {
					origamiService.mockRequest.query.modules = 'o-message@^1.0.0,o-teaser@^6.0.0';
					middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
				});

				it('creates a 400 HTTP error with a descriptive message', () => {
					assert.calledOnce(httpError);
					assert.calledWithExactly(httpError, 400, 'The specific module versions being requested are of different versions of the Origami spec.\n'+
					'o-message@^1.0.0 is Origami version 1\n'+
					'o-teaser@^6.0.0 is Origami version 2');
				});

				it('calls `next` with the created error', () => {
					assert.calledOnce(spyNext);
					assert.calledWithExactly(spyNext, httpError.mockError);
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
			});

		});

	});

});
