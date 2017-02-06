'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

// const httpError = require('../../../lib/express/httperror');

module.exports = sinon.stub().returnsThis({
	code: sinon.stub(),
	statusCode: sinon.stub(),
	message: sinon.stub(),
	stack: sinon.stub(),
});

// module.exports.instance = sinon.createStubInstance(httpError);
