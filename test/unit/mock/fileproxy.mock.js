'use strict';

const sinon = require('sinon');
require('sinon-as-promised');


const fileproxy = module.exports = sinon.stub();

const mockFileproxy = module.exports.mockFileproxy = {
	options: sinon.stub(),
	registry: sinon.stub(),
	installationManager: sinon.stub(),
	getContent: sinon.stub(),
	versionLockBuildserviceUrls: sinon.stub(),
	_versionLockUrl: sinon.stub(),
	getFileInfo: sinon.stub()
};

fileproxy.returns(mockFileproxy);
