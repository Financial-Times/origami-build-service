'use strict';

const sinon = require('sinon');

module.exports = sinon.stub().returns({
	disable: sinon.spy(),
	use: sinon.spy(),
	param: sinon.spy(),
	get: sinon.spy()
});

module.exports.mockRequest = {
	headers: {},
	query: {},
	params: {},
	method: '',
	originalUrl: ''
};

module.exports.mockResponse = {
	locals: {},
	location: sinon.stub(),
	redirect: sinon.stub().returnsThis(),
	render: sinon.stub().returnsThis(),
	send: sinon.stub().returnsThis(),
	set: sinon.stub().returnsThis(),
	status: sinon.stub().returnsThis(),
	end: sinon.stub(),
	writeHead: sinon.stub()
};
