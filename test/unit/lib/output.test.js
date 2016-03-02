'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/output', function() {
	let stream;
	let streamCat;
	let Output;

	beforeEach(function() {

		stream = require('../mock/stream.mock');

		streamCat = require('../mock/streamcat.mock');
		mockery.registerMock('streamcat', streamCat);

		Output = require('../../../lib/output');
	});

	it('should export a function', function() {
		assert.isFunction(Output);
	});

	describe('new Output(mimeType, bufferedContent, timeToLive)', function() {
		let instance;
		const mimeType = 'foo';
		const bufferedContent = new Buffer('bar');
		const timeToLive = 1234;
		const dateNow = 10000;

		beforeEach(function() {
			sinon.stub(Date, 'now').returns(dateNow);
			instance = new Output(mimeType, bufferedContent, timeToLive);
		});

		afterEach(function() {
			Date.now.restore();
		});

		it('should have a `mimeType` property set to `mimeType`', function() {
			assert.strictEqual(instance.mimeType, mimeType);
		});

		it('should have a `createdTime` property set to `Date.now()`', function() {
			assert.strictEqual(instance.createdTime, dateNow);
		});

		it('should have an `expiryTime` property set based on `timeToLive`', function() {
			assert.strictEqual(instance.expiryTime, dateNow + timeToLive);
		});

		it('should have a `stream` property containing a stream representation of `bufferedContent`', function() {
			assert.notCalled(streamCat);
			assert.strictEqual(instance.stream, streamCat.firstCall.returnValue);
			assert.calledOnce(streamCat);
			assert.deepEqual(streamCat.firstCall.args[0], [bufferedContent]);
		});

		it('should have a `pipe` method', function() {
			assert.isFunction(instance.pipe);
		});

		describe('.pipe(stream)', function() {
			let returnValue;

			beforeEach(function() {
				returnValue = instance.pipe(stream);
			});

			it('should return `stream`', function() {
				assert.strictEqual(returnValue, stream);
			});

			it('should write `bufferedContent` to `stream`', function() {
				assert.calledOnce(stream.write);
				assert.calledWithExactly(stream.write, bufferedContent);
			});

		});

	});

});
