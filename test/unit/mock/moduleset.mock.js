'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const moduleSet = module.exports = sinon.stub();

moduleSet._modules = sinon.stub();
moduleSet._id = sinon.stub();
moduleSet._fromArray = sinon.stub();
moduleSet.getIdentifier = sinon.stub();
moduleSet.getMainPathOverridesIdentifier = sinon.stub();
moduleSet.getResolvedModules = sinon.stub().returns([]);
moduleSet.hasExactVersionsOnly = sinon.stub();
moduleSet.toFullModuleNames = sinon.stub().resolves();
moduleSet.concatenate = sinon.stub();
moduleSet.parseModuleName = sinon.stub();

moduleSet.mockModuleSet = {
	_modules: moduleSet._modules,
	_id: moduleSet._id,
	_fromArray: moduleSet._fromArray,
	getIdentifier: moduleSet.getIdentifier,
	getMainPathOverridesIdentifier: moduleSet.getMainPathOverridesIdentifier,
	getResolvedModules: moduleSet.getResolvedModules,
	hasExactVersionsOnly: moduleSet.hasExactVersionsOnly,
	toFullModuleNames: moduleSet.toFullModuleNames,
	concatenate: moduleSet.concatenate,
	parseModuleName: moduleSet.parseModuleName
};

moduleSet.returns(moduleSet.mockModuleSet);
