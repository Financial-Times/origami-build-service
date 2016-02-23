'use strict';

function HTTPError(statusCode, msg, errorCode) {
	this.code = errorCode;
	this.statusCode = statusCode;
	this.message = msg;
	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, HTTPError);
	} else {
		this.stack = Error(msg).stack;
	}
}

HTTPError.prototype = Object.create(Error.prototype);
HTTPError.prototype.constructor = HTTPError;

module.exports = HTTPError;
