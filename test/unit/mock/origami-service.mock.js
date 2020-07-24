'use strict';

const log = require('../../mock/log.mock');
const sinon = require('sinon');
require('sinon-as-promised');

const origamiService = module.exports = sinon.stub();

const mockApp = module.exports.mockApp = {
	disable: sinon.stub(),
	enable: sinon.stub(),
	get: sinon.stub(),
	listen: sinon.stub(),
	locals: {},
	ft: {
		log,
		metrics: {
			count: sinon.stub()
		},
		options: {}
	},
	set: sinon.stub(),
	use: sinon.stub()
};

const mockServer = module.exports.mockServer = {};

const mockBasePathMiddleware = module.exports.mockBasePathMiddleware = sinon.spy();
const mockErrorHandlerMiddleware = module.exports.mockErrorHandlerMiddleware = sinon.spy();
const mockNotFoundMiddleware = module.exports.mockNotFoundMiddleware = sinon.spy();
origamiService.middleware = {
	getBasePath: sinon.stub().returns(mockBasePathMiddleware),
	errorHandler: sinon.stub().returns(mockErrorHandlerMiddleware),
	notFound: sinon.stub().returns(mockNotFoundMiddleware)
};

module.exports.mockRequest = {
	app: mockApp,
	basePath: '/',
	get: sinon.stub(),
	headers: {},
	method: '',
	originalUrl: '',
	path: '',
	query: {},
	params: {}
};

module.exports.mockResponse = {
	app: mockApp,
	end: sinon.stub().returnsThis(),
	locals: {},
	location: sinon.stub().returnsThis(),
	redirect: sinon.stub().returnsThis(),
	render: sinon.stub().returnsThis(),
	send: sinon.stub().returnsThis(),
	set: sinon.stub().returnsThis(),
	status: sinon.stub().returnsThis(),
	writeHead: sinon.stub().returnsThis()
};

module.exports.mockNext = sinon.stub();

mockApp.listen.resolves(mockServer);
origamiService.returns(mockApp);
