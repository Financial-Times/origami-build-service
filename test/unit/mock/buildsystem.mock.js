'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

module.exports = sinon.stub.returns({
	defaultExport: sinon.stub(),
	httpProxyTtl: sinon.stub(),
	installationManager: sinon.stub(),
	bundler: sinon.stub(),
	fileProxy: sinon.stub(),
	moduleMetadata: sinon.stub(),
	outputBundle: sinon.stub(),
	outputModuleMetadata: sinon.stub().resolves(),
	outputFile: sinon.stub()
});
