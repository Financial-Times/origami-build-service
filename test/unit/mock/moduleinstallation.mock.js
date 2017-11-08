'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const ModuleInstallation = (module.exports = sinon.stub());

const mockModuleInstallation = {
    listDirectOrigamiComponents: sinon.stub().resolves([]),
    listDirectNoneOrigamiComponents: sinon.stub().resolves([]),
    listAllOrigamiComponents: sinon.stub().resolves([]),
    listAllNoneOrigamiComponents: sinon.stub().resolves([])
};

ModuleInstallation.returns(mockModuleInstallation);
