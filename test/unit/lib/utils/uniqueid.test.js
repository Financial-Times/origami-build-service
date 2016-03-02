'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/utils/uniqueid', function() {
	let crypto;
	let uniqueid;

	beforeEach(function() {

		crypto = require('../../mock/crypto.mock');
		mockery.registerMock('crypto', crypto);

		uniqueid = require('../../../../lib/utils/uniqueid');
	});

	it('should export a function', function() {
		assert.isFunction(uniqueid);
	});

	describe('uniqueid(id, maxLength)', function() {
		let returnValue;

		describe('when `id.length` is less than `maxLength` and it is already ASCII safe', function() {

			beforeEach(function() {
				returnValue = uniqueid('hello-world', 100);
			});

			it('should return the id unchanged', function() {
				assert.strictEqual(returnValue, 'hello-world');
			});

		});

		describe('when `id.length` is less than `maxLength` but it is not ASCII safe', function() {
			let id;

			beforeEach(function() {
				crypto.createHash.returns({
					digest: sinon.stub().returns('foobarbazqux1234567890abcdef'),
					update: sinon.stub()
				});
				id = 'hello-world_+!;,.\'$£123%^*';
				returnValue = uniqueid(id, 100);
			});

			it('should create a sha1 crypto hash', function() {
				assert.calledOnce(crypto.createHash);
				assert.calledWithExactly(crypto.createHash, 'sha1');
			});

			it('should update the hash with the original `id`', function() {
				assert.calledOnce(crypto.createHash.firstCall.returnValue.update);
				assert.calledWithExactly(crypto.createHash.firstCall.returnValue.update, id);
			});

			it('should create a digest of the hash', function() {
				assert.calledOnce(crypto.createHash.firstCall.returnValue.digest);
				assert.calledWithExactly(crypto.createHash.firstCall.returnValue.digest, 'base64');
			});

			it('should return an ASCII safe representation of the id (with the hash truncated to 24 characters)', function() {
				assert.strictEqual(returnValue, 'hello-world_+!;,.\'__123___foobarbazqux1234567890ab');
			});

		});

		describe('when `id.length` is greater than `maxLength`', function() {
			let id;

			beforeEach(function() {
				crypto.createHash.returns({
					digest: sinon.stub().returns('foobarbazqux1234567890abcdef'),
					update: sinon.stub()
				});
				id = 'hello-world-how-are-you-today-foo-bar-baz';
				returnValue = uniqueid(id, 35);
			});

			it('should create a sha1 crypto hash', function() {
				assert.calledOnce(crypto.createHash);
				assert.calledWithExactly(crypto.createHash, 'sha1');
			});

			it('should update the hash with the original `id`', function() {
				assert.calledOnce(crypto.createHash.firstCall.returnValue.update);
				assert.calledWithExactly(crypto.createHash.firstCall.returnValue.update, id);
			});

			it('should create a digest of the hash', function() {
				assert.calledOnce(crypto.createHash.firstCall.returnValue.digest);
				assert.calledWithExactly(crypto.createHash.firstCall.returnValue.digest, 'base64');
			});

			it('should return an ASCII safe representation of the id (with the hash truncated to 24 characters)', function() {
				assert.strictEqual(returnValue, 'hello-worldfoobarbazqux1234567890ab');
			});

		});

	});

});
