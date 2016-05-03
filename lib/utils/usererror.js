'use strict';

function UserError(msg) {
	this.message = msg;
	this.type = 'UserError';
	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, UserError);
	} else {
		this.stack = Error(msg).stack;
	}
}

UserError.prototype = Object.create(Error.prototype);
UserError.prototype.constructor = UserError;

module.exports = UserError;
