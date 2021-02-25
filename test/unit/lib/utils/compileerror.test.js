/* eslint-disable new-cap */
'use strict';

const assert = require('chai').assert;

describe('lib/utils/compileerror', function () {
	let CompileError;

	beforeEach(function () {
		CompileError = require('../../../../lib/utils/compileerror');
	});

	it('should be a function', function () {
		assert.isFunction(CompileError);
	});

	describe('compileerror(message)', function () {
        it('is an instance of Error', function () {
            assert.instanceOf(new CompileError('uh oh'), Error);
        });
        it('in an instance of CompileError', function () {
            assert.instanceOf(new CompileError('uh oh'), CompileError);
        });
        it('sets the message instance property to the value of the argument', function () {
            assert.deepEqual(new CompileError('uh oh').message, 'uh oh');
        });
	});
});
