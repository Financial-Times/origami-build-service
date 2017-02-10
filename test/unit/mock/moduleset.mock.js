'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

module.exports = sinon.stub().returns({
	_modules: sinon.stub(),
	_id: sinon.stub(),
	_fromArray: sinon.stub(),
	getIdentifier: sinon.stub(),
	getMainPathOverridesIdentifier: sinon.stub(),
	getResolvedModules: sinon.stub(),
	hasExactVersionsOnly: sinon.stub(),
	toFullModuleNames: sinon.stub().resolves(),
	concatenate: sinon.stub(),
	parseModuleName: sinon.stub()
});
