'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');
const Q = testhelper.Q;
const HealthMonitor = testhelper.HealthMonitor;

suite('healthcheck', function(){
	this.timeout(4*1000);

	spawnTest('failedsynccheck', function*(){
		const monitor = new HealthMonitor();
		yield monitor.addCheck({'name':'test'}, function(){
			throw new Error('Bad');
		});
		monitor.getCheckResults();
		assert.notOk(monitor.getCheckResults()[0].ok);
	});

	spawnTest('failedcheck', function*(){
		const monitor = new HealthMonitor();
		yield monitor.addCheck({'name':'test'}, function(){
			return Q.Promise.resolve(true).then(function(){
				throw new Error('Bad');
			});
		});
		monitor.getCheckResults();
		assert.notOk(monitor.getCheckResults()[0].ok);
		assert.equal(monitor.getCheckResults()[0].checkOutput, 'Bad');
	});

	spawnTest('memcheck', function*(){
		const monitor = new HealthMonitor();
		yield monitor.addMemoryChecks({});

		const res = monitor.getCheckResults();
		assert.ok(res[0].ok);
		assert.ok(res[1].ok);
		assert.ok(res[2].ok);
		assert.ok(res[0].checkOutput > 0);
	});
});
