'use strict';

const assert = require('chai').assert;

describe('lib/utils/string-to-boolean', function() {
	let stringToBoolean;

	beforeEach(function() {
		stringToBoolean = require('../../../../lib/utils/string-to-boolean');
	});

	it('should export a function', function() {
		assert.isFunction(stringToBoolean);
	});

	describe('stringToBoolean(string)', function() {
		let boolean;

		describe('when `string` is "true"', function() {

			beforeEach(function() {
				boolean = stringToBoolean('true');
			});

			it('returns `true`', function() {
				assert.isTrue(boolean);
			});

		});

		describe('when `string` is "yes"', function() {

			beforeEach(function() {
				boolean = stringToBoolean('yes');
			});

			it('returns `true`', function() {
				assert.isTrue(boolean);
			});

		});

		describe('when `string` is "1"', function() {

			beforeEach(function() {
				boolean = stringToBoolean('1');
			});

			it('returns `true`', function() {
				assert.isTrue(boolean);
			});

		});

		describe('when `string` is "false"', function() {

			beforeEach(function() {
				boolean = stringToBoolean('false');
			});

			it('returns `false`', function() {
				assert.isFalse(boolean);
			});

		});

		describe('when `string` is "no"', function() {

			beforeEach(function() {
				boolean = stringToBoolean('no');
			});

			it('returns `false`', function() {
				assert.isFalse(boolean);
			});

		});

		describe('when `string` is "0"', function() {

			beforeEach(function() {
				boolean = stringToBoolean('0');
			});

			it('returns `false`', function() {
				assert.isFalse(boolean);
			});

		});

		describe('when `string` is "none"', function() {

			beforeEach(function() {
				boolean = stringToBoolean('none');
			});

			it('returns `false`', function() {
				assert.isFalse(boolean);
			});

		});

		describe('when `string` is empty', function() {

			beforeEach(function() {
				boolean = stringToBoolean('');
			});

			it('returns `false`', function() {
				assert.isFalse(boolean);
			});

		});

		describe('when `string` is any other value', function() {

			beforeEach(function() {
				boolean = stringToBoolean('foobar');
			});

			it('returns `true`', function() {
				assert.isTrue(boolean);
			});

		});

	});

});
