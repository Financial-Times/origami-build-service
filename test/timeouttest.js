'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');
const Q = testhelper.Q;

suite('timeout', function(){
	const ttlScale = 10;

	spawnTest('made-it', function*(){
		yield Q.maxWait(8*ttlScale, Q.delay(4*ttlScale), 'test');
	});

	spawnTest('missed-it', function*(){
		try {
			yield Q.maxWait(10*ttlScale, Q.delay(20*ttlScale), 'test2');
			assert(false, 'should throw');
		} catch(e) {
			assert.include(e.message, 'test2');
		}
	});
});
