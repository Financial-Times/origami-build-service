'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');
require('sinon-as-promised');

sinon.assert.expose(assert, {
	includeFail: false,
	prefix: ''
});

beforeEach(function() {
	mockery.enable({
		useCleanCache: true,
		warnOnUnregistered: false,
		warnOnReplace: false
	});
});

afterEach(function() {
	mockery.deregisterAll();
	mockery.disable();
});
