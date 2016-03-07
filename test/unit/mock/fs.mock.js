'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

module.exports = {
	createReadStream: sinon.stub().returns({
		_mockReadStream: true
	})
};
