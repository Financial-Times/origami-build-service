'use strict';

const request = require('supertest');
const proclaim = require('proclaim');

describe('GET /__health', function () {
	this.timeout(20000);
	this.slow(5000);

	beforeEach(function () {
		this.request = request(this.app)
			.get('/__health')
			.set('Connection', 'close');
	});

	it('should respond with a 200 status', function (done) {
		this.request.expect(200).end(done);
	});

	it('should respond with UTF-8 JSON', function (done) {
		this.request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('should contain health data', function (done) {
		this.request.expect(function (res) {
			proclaim.equal(res.body.schemaVersion, 1);
			proclaim.equal(res.body.name, 'build-service');
			proclaim.equal(res.body.systemCode, 'build-service');
			proclaim.equal(res.body.description, 'Front end build process as a service.  Fetches specified Origami components from git, runs Origami build process, and returns the resulting CSS or JS bundle over HTTP.');
			proclaim.lessThanOrEqual(res.body.checks.length, 11);
		}).end(done);
	});

});
