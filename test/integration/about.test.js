'use strict';

const request = require('supertest');
const proclaim = require('proclaim');

describe('GET /__about', function () {
	this.timeout(20000);
	this.slow(5000);

	beforeEach(function () {
		this.request = request(this.app)
			.get('/__about')
			.set('Connection', 'close');
	});

	it('should respond with a 200 status', function (done) {
		this.request.expect(200).end(done);
	});

	it('should respond with UTF-8 JSON', function (done) {
		this.request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('should contain about data', function (done) {
		this.request.expect(function (res) {
			proclaim.isObject(res.body);

			const aboutInfo = Object.assign({}, require('../../about.json'));
			// we have to remove the dateDeployed key as it doesn't match
			delete res.body.dateDeployed;
			delete aboutInfo.dateDeployed;

			// we have to remove the appVersion and _hostname as will be different when running the tests against the real servers.
			delete res.body.appVersion;
			delete res.body._hostname;
			proclaim.deepEqual(res.body, aboutInfo);
		}).end(done);
	});

});
