/* eslint-disable new-cap */
'use strict';

const assert = require('chai').assert;

describe('lib/utils/usererror', function () {
	let UserError;

	beforeEach(function () {
		UserError = require('../../../../lib/utils/usererror');
	});

	it('should be a function', function () {
		assert.isFunction(UserError);
	});

	describe('UserError(message)', function () {
        it('is an instance of Error', function () {
            assert.instanceOf(new UserError('incorrect configuration'), Error);
        });
        it('in an instance of UserError', function () {
            assert.instanceOf(new UserError('incorrect configuration'), UserError);
        });
        it('sets the message instance property to the value of the argument', function () {
            assert.deepEqual(new UserError('incorrect configuration').message, 'incorrect configuration');
        });
	});
});
