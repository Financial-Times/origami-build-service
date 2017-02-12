'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const ModuleMetadata = module.exports = sinon.stub();

ModuleMetadata.bundler = sinon.stub();
ModuleMetadata.installationManager = sinon.stub();
ModuleMetadata._getFileFromList = sinon.stub();
ModuleMetadata.getContent = sinon.stub();

ModuleMetadata.returns({
	bundler: ModuleMetadata.bundler,
	installationManager: ModuleMetadata.installationManager,
	_getFileFromList: ModuleMetadata._getFileFromList,
	getContent: ModuleMetadata.getContent
});
