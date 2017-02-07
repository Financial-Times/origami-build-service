'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

module.exports = sinon.stub().returnsThis({
	code: sinon.stub(),
	statusCode: sinon.stub(),
	message: sinon.stub(),
	stack: sinon.stub(),
});

