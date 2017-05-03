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

			// we have to remove the dateDeployed key as it doesn't match
			const aboutInfo = Object.assign({}, require('../../about.json'));
			delete res.body.dateDeployed;
			delete aboutInfo.dateDeployed;
			proclaim.deepEqual(res.body, aboutInfo);
		}).end(done);
	});

});
