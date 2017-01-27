'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/index', function() {
	let errorResponse;
	let express;
	let getBasePath;
	let index;
	let log;
	let logHostname;
	let morgan;
	let raven;
	let routes;

	beforeEach(function() {

		errorResponse = require('../mock/errorresponse.mock');
		mockery.registerMock('./express/errorresponse', errorResponse);

		express = require('../mock/express.mock');
		mockery.registerMock('express', express);

		getBasePath = sinon.spy();
		mockery.registerMock('./express/get-base-path', getBasePath);

		routes = require('../mock/routes.mock');
		mockery.registerMock('./routes', routes);

		log = require('../mock/log.mock');
		mockery.registerMock('./utils/log', log);

		logHostname = sinon.spy();
		mockery.registerMock('./express/log-hostname', logHostname);

		morgan = require('../mock/morgan.mock');
		mockery.registerMock('morgan', morgan);

		raven = require('../mock/raven.mock');
		mockery.registerMock('raven', raven);

		index = require('../../../lib');
	});

	it('should export a function', function() {
		assert.isFunction(index);
	});

	describe('index(config)', function() {
		let config;
		let expressApp;

		beforeEach(function() {
			config = {};
			expressApp = index(config);
		});

		it('should create an Express application', function() {
			assert.calledOnce(express);
		});

		it('should return the created Express application', function() {
			assert.strictEqual(expressApp, express.firstCall.returnValue);
		});

		it('should disable the X-Powered-By header', function() {
			assert.calledWithExactly(expressApp.disable, 'x-powered-by');
		});

		it('should create a raven request handler with the logger raven client', function() {
			assert.calledOnce(raven.middleware.express.requestHandler);
			assert.calledWithExactly(raven.middleware.express.requestHandler, log.ravenClient);
		});

		it('should register the raven request handler', function() {
			assert.calledWithExactly(expressApp.use, raven.middleware.express.requestHandler.firstCall.returnValue);
		});

		it('should not create a morgan logger', function() {
			assert.notCalled(morgan);
		});

		it('should register the get-base-path middleware', function() {
			assert.calledWithExactly(expressApp.use, getBasePath);
		});

		it('should register the log-hostname middleware', function() {
			assert.calledWithExactly(expressApp.use, logHostname);
		});

		it('should register the bundles route', function() {
			assert.calledOnce(routes.bundles);
			assert.calledWithExactly(routes.bundles, expressApp, config);
		});

		it('should register the demos route', function() {
			assert.calledOnce(routes.demos);
			assert.calledWithExactly(routes.demos, expressApp, config);
		});

		it('should register the files route', function() {
			assert.calledOnce(routes.files);
			assert.calledWithExactly(routes.files, expressApp, config);
		});

		it('should register the modules route', function() {
			assert.calledOnce(routes.modules);
			assert.calledWithExactly(routes.modules, expressApp, config);
		});

		it('should register the docs route', function() {
			assert.calledOnce(routes.docs);
			assert.calledWithExactly(routes.docs, expressApp, config);
		});

		it('should register the health route', function() {
			assert.calledOnce(routes.health);
			assert.calledWithExactly(routes.health, expressApp, config);
		});

		it('should register the robots route', function() {
			assert.calledOnce(routes.robots);
			assert.calledWithExactly(routes.robots, expressApp);
		});

		it('should register the error middleware', function() {
			assert.calledWithExactly(expressApp.use, errorResponse);
		});

		it('should create a raven error handler with the logger raven client', function() {
			assert.calledOnce(raven.middleware.express.errorHandler);
			assert.calledWithExactly(raven.middleware.express.errorHandler, log.ravenClient);
		});

		it('should register the raven error handler', function() {
			assert.calledWithExactly(expressApp.use, raven.middleware.express.errorHandler.firstCall.returnValue);
		});

		describe('when `config.writeAccessLog` is `true`', function() {

			beforeEach(function() {
				config = {
					writeAccessLog: true
				};
				expressApp = index(config);
			});

			it('should create a morgan logger', function() {
				assert.calledOnce(morgan);
				assert.calledWithExactly(morgan, 'combined');
			});

			it('should register the morgan logger', function() {
				assert.calledWithExactly(expressApp.use, morgan.firstCall.returnValue);
			});

		});

	});

});
