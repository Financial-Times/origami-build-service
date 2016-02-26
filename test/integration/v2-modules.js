'use strict';

const assert = require('chai').assert;
const request = require('supertest');

describe('GET /v2/modules', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module is requested', function() {
		const moduleName = 'mock-modules%2Ftest-ok';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/modules/${moduleName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with JSON', function(done) {
			this.request.expect('Content-Type', 'application/json;charset=UTF-8').end(done);
		});

		it('should respond with the module information', function(done) {
			this.request.end((error, response) => {
				const json = JSON.parse(response.text);
				assert.strictEqual(json.build.bundler.valid, true);
				assert.strictEqual(json.build.js.valid, true);
				assert.strictEqual(json.build.css.valid, true);
				assert.strictEqual(json.bowerEndpoint, 'test-ok=mock-modules/test-ok');
				assert.strictEqual(json.bowerManifest.name, 'test-ok');
				assert.strictEqual(json.readme, 'I\'m a README\n');
				done();
			});
		});

	});

	describe('when an invalid module is requested (nonexistent)', function() {
		const moduleName = 'mock-modules%2Ftest-404';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/modules/${moduleName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message in a comment', function(done) {
			this.request.expect(/^\/\*\n\npackage .* not found/i).end(done);
		});

	});

	describe('when an invalid module is requested (Sass/JavaScript compilation errors)', function() {
		const moduleName = 'mock-modules%2Ftest-compile-error';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/modules/${moduleName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with JSON', function(done) {
			this.request.expect('Content-Type', 'application/json;charset=UTF-8').end(done);
		});

		it('should respond with the module information', function(done) {
			this.request.end((error, response) => {
				const json = JSON.parse(response.text);
				assert.strictEqual(json.build.bundler.valid, true);
				assert.strictEqual(json.build.js.valid, false);
				assert.strictEqual(json.build.css.valid, false);
				assert.strictEqual(json.bowerEndpoint, 'test-compile-error=mock-modules/test-compile-error');
				assert.strictEqual(json.bowerManifest.name, 'test-compile-error');
				done();
			});
		});

	});

});
