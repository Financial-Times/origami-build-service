/* eslint-disable new-cap */
'use strict';

const assert = require('chai').assert;

describe('lib/utils/componentError', function () {
	let ComponentError;

	beforeEach(function () {
		ComponentError = require('../../../../lib/utils/componentError');
	});

	it('should be a function', function () {
		assert.isFunction(ComponentError);
	});

	describe('componentError(message)', function () {
        it('is an instance of Error', function () {
            assert.instanceOf(new ComponentError('uh oh'), Error);
        });
        it('in an instance of ComponentError', function () {
            assert.instanceOf(new ComponentError('uh oh'), ComponentError);
        });
        it('sets the message instance property to the value of the argument', function () {
            assert.deepEqual(new ComponentError('uh oh').message, 'uh oh');
        });
	});
});
