'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

module.exports = {
	stat: sinon.stub(),
	createReadStream: sinon.stub().returns({
		_mockReadStream: true
	})
};
