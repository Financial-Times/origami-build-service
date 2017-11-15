'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');
const Q = testhelper.Q;

suite('qtest', function(){

	test('strict', function() {
		function cb() {
			assert.isUndefined(this);
		}
		cb();
	});

	test('capture runs sync', function(){
		let ok = false;
		Q.captureErrors(function(){
			ok = true;
		});
		assert.ok(ok);
	});

	spawnTest('captures immediate error', function*(){
		try {
			yield Q.captureErrors(function(){
				assert.isUndefined(this);
				throw Error('Immediate');
			});
			assert.fail('Expected error');
		} catch(err) {
			assert.equal('Immediate', err.message);
		}
	});

	spawnTest('captures delayed error', function*(){
		try {
			yield Q.captureErrors(function(){
				setTimeout(function(){
					throw Error('Delayed');
				}, 10);
				return Q.delay(2000);
			});
			assert.fail('Expected error');
		} catch (err) {
			assert.equal('Delayed', err.message);
		}
	});

	spawnTest('only allows promises', function*(){
		try {
			yield Q.captureErrors(function(){
				return true;
			});
			assert.fail('Expected error: should complain about lack of Promise');
		} catch(err) {
			assert.ok(err, 'Should complain about lack of Promise');
		}
	});

	spawnTest('all ok', function*(){
		const ok = yield Q.captureErrors(function(){
			return Q.resolve(true);
		});
		assert.ok(ok);
	});
});
