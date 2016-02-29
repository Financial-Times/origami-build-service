'use strict';

const sinon = require('sinon');

module.exports = {
	createHash: sinon.stub().returns({
		digest: sinon.stub(),
		update: sinon.stub()
	})
};
