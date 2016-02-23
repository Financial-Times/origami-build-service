'use strict';

function CompileError(msg) {
	this.message = msg;
	this.type = 'CompileError';
	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, CompileError);
	} else {
		this.stack = Error(msg).stack;
	}
}

CompileError.prototype = Object.create(Error.prototype);
CompileError.prototype.constructor = CompileError;

module.exports = CompileError;
