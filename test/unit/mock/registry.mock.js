'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

module.exports = function() {
	return {
		getPackageList: sinon.stub().resolves([]),
		packageListByURL: sinon.stub().resolves({}),
		bowerRegistryURL: ''
	};
};
