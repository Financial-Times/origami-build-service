'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');
const Q = testhelper.Q;

const PromiseCache = testhelper.PromiseCache;

describe('promisecache', function(){

	spawnTest('cache-overflow', function*(){
		const e = new PromiseCache({ capacity: 3 });

		for(let i=0; i < 5; i++) {
			yield e.get({
				timeToLive: 1000,
				id: 'a'+i,
				createCallback: function(){return {result:'first'+i};},
			});
			assert.equal(yield e.get({
				timeToLive: 1000,
				id: 'a'+i,
				createCallback: function(){return {result:'second'+i};},
			}), 'first'+i, 'First call should have cached the value');
		}

		assert.equal(yield e.get({
			timeToLive: 1000,
			id: 'a0',
			createCallback: function(){return {result:'third'};},
		}), 'third', 'Cache should have purged earliest entry already');
	});

	spawnTest('cache-expiry', function*(){
		const e = new PromiseCache();
		yield e.get({
			timeToLive: 1000,
			id: 'key',
			createCallback: function(){return {result:Q.Promise.resolve('cached first')};},
		});

		assert.equal(yield e.get({
			timeToLive: 1000,
			id: 'key',
			createCallback: function(){return {result:'not used'};},
			newerThan: Date.now()-1000,
		}), 'cached first', 'Expected old value');

		yield Q.delay(5);

		assert.equal(yield e.get({
			timeToLive: 1000,
			id: 'key',
			createCallback: function(){return {result:'cached second'};},
			newerThan: Date.now()+1000,
		}), 'cached second', 'Expected new value');

		assert.equal(yield e.get({
			timeToLive: 1000,
			id: 'key',
			createCallback: function(){return {result:'not used'};},
		}), 'cached second', 'Expected newest value');

		assert.notEqual(yield e.get({
			timeToLive: 1000,
			id: 'key',
			createCallback: function(){return {result:'not used'};},
			newerThan: Date.now()-10000,
		}), 'not used', 'Expected any previous value');
	});

	it('cache-time-expiry', function(done){
		const ttlScale = 5; // slow down test in Jenkins
		const e = new PromiseCache();
		e.get({
			id: 'key',
			timeToLive: 50*ttlScale,
			createCallback: function(){
				return Q.delay(10*ttlScale).then(function(){
					return {result:'cached first'};
				});
			},
		}).catch(done);

		setTimeout(function(){
			e.get({
				timeToLive: 1000,
				id: 'key',
				createCallback: function(){return {result:'not used'};},
			}).then(function(res){
				assert.equal(res, 'cached first', 'Expected old value');
			}).catch(done);
		}, 4*ttlScale);

		setTimeout(function(){
			e.get({
				timeToLive: 1000,
				id: 'key',
				createCallback: function(){return {result:'not used'};},
			}).then(function(res){
				assert.equal(res, 'cached first', 'Expected old value');
			}).catch(done);
		}, 25*ttlScale);

		setTimeout(function(){
			e.get({
				timeToLive: 1000,
				id: 'key',
				createCallback: function(){
					return Q.delay(30*ttlScale).then(function(){
						return {result:'new value'};
					});
				},
			}).then(function(res){
				assert.equal(res, 'cached first', 'Expected old while new is building');
			}).catch(done);
		}, 75*ttlScale);

		setTimeout(function(){
			e.get({
				timeToLive: 1000,
				id: 'key',
				createCallback: function(){return {result:'wrong, should be building by now'};},
			}).then(function(res){
				assert.equal(res, 'cached first', 'Expected old while new is building');
			}).catch(done);

		}, 80*ttlScale);

		setTimeout(function(){
			e.get({
				timeToLive: 1000,
				id: 'key',
				createCallback: function(){return {result:'bad'};},
			}).then(function(res){
				assert.equal(res, 'new value', 'Expected build to finish');
			})
				.then(done, done);
		}, 150*ttlScale);
	});

	it('date-parse', function(){
		assert.equal(1386684780000, Date.parse('2013-12-10T14:13'));
	});

	it('called-once', function(){
		const e = new PromiseCache();
		let count=0;
		function inc() {
			count++;
			return Q.delay(20).then(function(){
				return {result:true};
			});
		}

		e.get({id:'key', createCallback:inc, timeToLive: 1000});
		assert.equal(0, count, 'Callback should be wrapped in a promise and not called immediately');

		Q.all([
			e.get({id:'key', createCallback:inc, timeToLive: 1000}),
			e.get({id:'key', createCallback:inc, timeToLive: 1000}),
			e.get({id:'key', createCallback:inc, timeToLive: 1000}),
			e.get({id:'key', createCallback:inc, timeToLive: 1000}),
			e.get({id:'key', createCallback:inc, timeToLive: 1000}),
		]).then(function(){
			e.get({id:'key', createCallback:inc, timeToLive: 1000});
			assert.equal(1, count, 'Same promise should be returned');
		});
	});


	spawnTest('error-ttl', function*(){
		const e = new PromiseCache();
		let now = 1;
		e.now = function(){return now;};

		// should not throw synchronously
		const promise = e.get({
			id:'key',
			timeToLive: 30000,
			errorTimeToLive: 15000,
			createCallback:function(){
				throw new Error('Boo');
			},
		});

		now += 100;

		try {
			yield promise;
			assert.notOk('Promise should have been rejected');
		} catch(e) {
			assert.include(e.message, 'Boo');
		}

		now += 5000;

		try {
			yield promise;
			assert.notOk('Promise should have been rejected, again');
		} catch(e) {
			assert.include(e.message, 'Boo');
		}

		try {
			yield e.get({
				id:'key',
				timeToLive: 30000,
				errorTimeToLive: 15000,
				createCallback:function(){
					return 'don\'t use this';
				},
			});
			assert.notOk('Expected cached rejected promise again');
		} catch(e) {
			assert.include(e.message, 'Boo');
		}

		now += 10001;

		assert.isTrue(yield e.get({
			id:'key',
			timeToLive: 30000,
			errorTimeToLive: 15000,
			createCallback:function(){
				return {result:true};
			},
		}));

		now += 500;

		assert.isTrue(yield e.get({
			id:'key',
			timeToLive: 30000,
			errorTimeToLive: 15000,
			createCallback:function(){
				return {result:false};
			},
		}));
	});

	spawnTest('stale-response', function*(){
		const e = new PromiseCache();
		let count=0;
		function inc() {
			const nthcall = ++count;
			return Q.delay(20).then(function(){
				return {result:nthcall};
			});
		}

		const firstcall = e.get({id:'key', createCallback:inc, timeToLive: 1000});
		assert.equal(0, count, 'Callback should be deferred');
		assert.equal(1, yield firstcall);

		const secondcall = e.get({id:'key', createCallback:inc, timeToLive: 1000, newerThan: Date.now()-1});

		const thirdcall = e.get({id:'key', createCallback:inc, timeToLive: 1000});
		assert.equal(1, yield thirdcall, 'Call without newerThan should return stale response');
		assert.equal(1, yield e.get({id:'key', createCallback:inc, newerThan: Date.now()-3600*1000, timeToLive: 1000}), 'Call with old newerThan should return stale response');

		assert.equal(2, yield secondcall, 'Call with fresh newerThan was supposed to start async update');
		assert.equal(2, yield e.get({id:'key', createCallback:inc, timeToLive: 1000}), 'New value should replace old one');
	});

	spawnTest('re-evaluate', function*(){
		const e = new PromiseCache();
		let now = 1;
		e.now = function(){return now;};

		yield e.get({
			id:'foo',
			timeToLive: 10,
			createCallback: function() {
				return {result:1};
			},
		});

		now = 5;

		const longbuild2 = Q.defer();
		const wantsfresh2 = e.get({
			id:'foo',
			timeToLive: 10,
			newerThan: now,
			createCallback: function() {
				return longbuild2.promise;
			},
		});

		now = 15;

		const longbuild3 = Q.defer();
		const wantsfresh3 = e.get({
			id:'foo',
			timeToLive: 10,
			newerThan: now,
			createCallback: function() {
				return longbuild3.promise;
			},
		});

		longbuild2.resolve({result:2});
		longbuild3.resolve({result:3});

		assert.equal(yield wantsfresh2, 2);
		assert.equal(yield wantsfresh3, 3);
	});

	spawnTest('failures', function*(){
		const e = new PromiseCache();
		let now = 1;
		e.now = function(){return now;};

		try {
			yield e.get({
				id: 'key',
				timeToLive: 9999,
				errorTimeToLive: 10,
				createCallback: function(){throw new Error('Fail1');},
			});
			assert(false, 'Expected error');
		} catch(err) {
			assert.equal(err.message, 'Fail1');
		}

		now++;
		let calledSecondCallback = false;
		try {
			yield e.get({
				id: 'key',
				timeToLive: 9999,
				errorTimeToLive: 10,
				createCallback: function(){calledSecondCallback = true; throw new Error('Fail2');},
			});
			assert(false, 'Expected error');
		} catch(err) {
			assert.equal(err.message, 'Fail1', 'Should have kept cached failure');
		}
		assert.notOk(calledSecondCallback, 'Just use cached copy of the error');

		now+=55;
		try {
			yield e.get({
				id: 'key',
				timeToLive: 10000,
				errorTimeToLive: 10,
				createCallback: function(){throw new Error('Fail3');},
			});
			assert(false, 'Expected error');
		} catch(err) {
			assert.equal(err.message, 'Fail3', 'Old error should have expired');
		}

		now += 55;
		assert.equal(yield e.get({
			id: 'key',
			timeToLive: 10000,
			errorTimeToLive: 10,
			createCallback: function(){return {result: 'ok'};},
		}), 'ok');
	});

	spawnTest('ttl', function*(){
		const e = new PromiseCache();
		let now = 1;
		e.now = function(){return now;};

		assert.equal(yield e.get({
			id: 'key',
			timeToLive: 1000,
			createCallback: function(){return {result:'cache me'};},
		}), 'cache me');

		now += 999;
		assert.equal(yield e.get({
			id: 'key',
			timeToLive: 1000,
			createCallback: function(){return {result:'don\'t use this'};},
		}), 'cache me');

		now += 100;
		assert.equal(yield e.get({
			id: 'key',
			timeToLive: 99999,
			createCallback: function(){
				return {
					result:'value with custom ttl',
					timeToLive: 5,
				};
			},
		}), 'cache me', 'Old value should be returned while new one is being created');

		yield Q.Promise.resolve(true); // go back to the event loop to ensure callback queued by the previous get() had time to run

		assert.equal(yield e.get({
			id: 'key',
			timeToLive: 100,
			createCallback: function(){return {result:'too new, previous one should be ready now'};},
		}), 'value with custom ttl');

		now += 10;
		assert.equal(yield e.get({
			id: 'key',
			timeToLive: 100,
			createCallback: function(){return {result:'value past 99999'};},
		}), 'value with custom ttl');

		assert.equal(yield e.get({
			id: 'key',
			timeToLive: 100,
			createCallback: function(){return {result:'nevermind'};},
		}), 'value past 99999');
	});
});
