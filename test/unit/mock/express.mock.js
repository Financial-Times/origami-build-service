'use strict';

const sinon = require('sinon');

module.exports = sinon.stub().returns({
	disable: sinon.spy(),
	use: sinon.spy()
});
