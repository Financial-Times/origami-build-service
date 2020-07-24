'use strict';

const sinon = require('sinon');

module.exports = {
	error: sinon.spy(),
	fatal: sinon.spy(),
	info: sinon.spy(),
	ravenClient: {
		_mockRavenClient: true
	},
	trace: sinon.spy(),
	warn: sinon.spy()
};
