'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const path = require('path');
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
	let BuildSystem;
	let Registry;
	let requireAll;
	let basePath;

	beforeEach(function() {
		basePath = path.resolve(`${__dirname}/../../../lib`);

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

		Registry = require('../mock/registry.mock');
		mockery.registerMock('./registry', Registry);

		BuildSystem = require('../mock/buildsystem.mock');
		mockery.registerMock('./buildsystem', BuildSystem);

		requireAll = require('../mock/require-all.mock');
		mockery.registerMock('require-all', requireAll);

		index = require(basePath);
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

		it('should create a morgan logger', function() {
			assert.calledOnce(morgan);
			assert.calledWithExactly(morgan, 'combined');
		});

		it('should register the morgan logger', function() {
			assert.calledWithExactly(expressApp.use, morgan.firstCall.returnValue);
		});

		it('loads all of the routes', () => {
			assert.calledOnce(requireAll);
			assert.isObject(requireAll.firstCall.args[0]);
			assert.strictEqual(requireAll.firstCall.args[0].dirname, `${basePath}/routes`);
			assert.isFunction(requireAll.firstCall.args[0].resolve);
		});

		it('should register the get-base-path middleware', function() {
			assert.calledWithExactly(expressApp.use, getBasePath);
		});

		it('should register the log-hostname middleware', function() {
			assert.calledWithExactly(expressApp.use, logHostname);
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

	});

});
