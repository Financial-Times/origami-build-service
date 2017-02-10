'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const installationmanager = module.exports = sinon.stub();
installationmanager._temporaryDirectory = sinon.stub();
installationmanager._directoryInitialised = sinon.stub();
installationmanager._installationCache = sinon.stub();
installationmanager._packageRegistry = sinon.stub();
installationmanager.createInstallation = sinon.stub();
installationmanager._getTTL = sinon.stub();

installationmanager.returns({
	_temporaryDirectory: installationmanager._temporaryDirectory,
	_directoryInitialised: installationmanager._directoryInitialised,
	_installationCache: installationmanager._installationCache,
	_packageRegistry: installationmanager._packageRegistry,
	createInstallation: installationmanager.createInstallation,
	_getTTL: installationmanager._getTTL
});
