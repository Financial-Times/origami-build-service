/* eslint-env mocha */
'use strict';

const mockery = require('mockery');
const sinon = require('sinon');

describe('obt', function() {

	const moduleUnderTest = '../lib/origami-build-tools';

	const version = process.version;
	const updateNotifierMock = sinon.stub();

	beforeEach(function() {
		updateNotifierMock.resetHistory();

		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});

		mockery.registerAllowable(moduleUnderTest);

		mockery.resetCache();
	});

	after(() => {
		mockery.resetCache();
		mockery.deregisterAll();
		mockery.disable();
		process.version = version;
	});
});
