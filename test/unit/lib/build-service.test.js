'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const path = require('path');
const sinon = require('sinon');

describe('lib/build-service', () => {
	let about;
	let basePath;
	let buildService;
	let logHostname;
	let origamiService;
	let requireAll;
	let sanitizeErrors;

	beforeEach(() => {
		basePath = path.resolve(`${__dirname}/../../..`);

		about = {mockAboutInfo: true};
		mockery.registerMock('../about.json', about);

		logHostname = require('../mock/log-hostname.mock');
		mockery.registerMock('./middleware/log-hostname', logHostname);

		origamiService = require('../mock/origami-service.mock');
		mockery.registerMock('@financial-times/origami-service', origamiService);

		requireAll = require('../mock/require-all.mock');
		mockery.registerMock('require-all', requireAll);

		sanitizeErrors = require('../mock/sanitize-errors.mock');
		mockery.registerMock('./middleware/sanitize-errors', sanitizeErrors);

		buildService = require(basePath);
	});

	it('exports a function', () => {
		assert.isFunction(buildService);
	});

	describe('buildService(options)', () => {
		let options;
		let returnValue;
		let routes;

		beforeEach(() => {
			options = {
				environment: 'test',
				port: 1234,
				systemCode: 'example-system-code',
				log: {
					info: sinon.spy()
				}
			};
			routes = {
				foo: sinon.spy(),
				bar: sinon.spy()
			};
			requireAll.returns(routes);
			returnValue = buildService(options);
		});

		it('creates an Origami Service application', () => {
			assert.calledOnce(origamiService);
		});

		it('sets `options.about` to the contents of about.json', () => {
			assert.strictEqual(options.about, about);
		});

		it('creates and mounts getBasePath middleware', () => {
			assert.calledOnce(origamiService.middleware.getBasePath);
			assert.calledWithExactly(origamiService.middleware.getBasePath);
			assert.calledWith(origamiService.mockApp.use, origamiService.middleware.getBasePath.firstCall.returnValue);
		});

		it('creates and mounts logHostname middleware', () => {
			assert.called(logHostname);
			assert.calledWithExactly(logHostname, options.log);
			assert.calledWith(origamiService.mockApp.use, logHostname.firstCall.returnValue);
		});

		it('loads all of the routes', () => {
			assert.calledOnce(requireAll);
			assert.isObject(requireAll.firstCall.args[0]);
			assert.strictEqual(requireAll.firstCall.args[0].dirname, `${basePath}/lib/routes`);
			assert.isFunction(requireAll.firstCall.args[0].resolve);
		});

		it('calls each route with the Origami Service application', () => {
			const route = sinon.spy();
			requireAll.firstCall.args[0].resolve(route);
			assert.calledOnce(route);
			assert.calledWithExactly(route, origamiService.mockApp);
		});

		it('creates and mounts not found middleware', () => {
			assert.called(origamiService.middleware.notFound);
			assert.calledWithExactly(origamiService.middleware.notFound);
			assert.calledWith(origamiService.mockApp.use, origamiService.middleware.notFound.firstCall.returnValue);
		});

		it('creates and mounts error sanitization middleware', () => {
			assert.called(sanitizeErrors);
			assert.calledWithExactly(sanitizeErrors);
			assert.calledWith(origamiService.mockApp.use, sanitizeErrors.firstCall.returnValue);
		});

		it('creates and mounts error handling middleware', () => {
			assert.called(origamiService.middleware.errorHandler);
			assert.calledWithExactly(origamiService.middleware.errorHandler);
			assert.calledWith(origamiService.mockApp.use, origamiService.middleware.errorHandler.firstCall.returnValue);
		});

		it('returns the created application', () => {
			assert.strictEqual(returnValue, origamiService.mockApp);
		});

	});

});
