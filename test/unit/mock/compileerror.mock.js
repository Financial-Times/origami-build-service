'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const CompileError = module.exports = sinon.stub();

CompileError.type = sinon.stub();
CompileError.statusCode = sinon.stub();
CompileError.message = sinon.stub();
CompileError.stack = sinon.stub();

CompileError.mockInstance = {
	type: CompileError.type,
	statusCode: CompileError.statusCode,
	message: CompileError.message,
	stack: CompileError.stack
};

CompileError.returns(CompileError.mockInstance);

