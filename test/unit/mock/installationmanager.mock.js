'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

module.exports = sinon.stub.returns({
	_temporaryDirectory: sinon.stub(),
	_directoryInitialised: sinon.stub(),
	_installationCache: sinon.stub(),
	_packageRegistry: sinon.stub(),
	createInstallation: sinon.stub(),
	_getTTL: sinon.stub()
});
