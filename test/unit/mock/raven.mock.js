'use strict';

const sinon = require('sinon');

module.exports = {
	Client: sinon.stub().returns({
		_mockRavenClient: true
	}),
	middleware: {
		express: {
			errorHandler: sinon.stub().returns({
				_mockRavenErrorHandler: true
			}),
			requestHandler: sinon.stub().returns({
				_mockRavenRequestHandler: true
			})
		}
	}
};
