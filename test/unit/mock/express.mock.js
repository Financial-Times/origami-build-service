'use strict';

const sinon = require('sinon');

module.exports = sinon.stub().returns({
	disable: sinon.spy(),
	use: sinon.spy(),
});

module.exports.createMockResponse = function() {
	const response = {
		location: sinon.stub(),
		send: sinon.stub(),
		status: sinon.stub()
	};
	response.location.returns(response);
	response.status.returns(response);
	return response;
};
