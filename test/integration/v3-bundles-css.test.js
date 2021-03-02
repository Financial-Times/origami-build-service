'use strict';

const proclaim = require('proclaim');
const request = require('supertest');

describe('GET /v3/bundles/css', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module, valid brand and valid system-code is requested', function() {
		const moduleName = '@financial-times/o-test-component@v2.0.0-beta.1';
		const brand = 'master';
		const systemCode = 'origami';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/bundles/css?modules=${moduleName}&brand=${brand}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(response => {
				proclaim.deepStrictEqual(response.status, 200);
			}).end(done);
		});

		it('should respond with the css', function(done) {
			this.request.expect(({text}) => {
				proclaim.deepStrictEqual(text, '.o-test-component{padding:.5em 1em;background-color:pink}.o-test-component:after{content:\'The square root of 64 is "8".\'}\n');
			}).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/css; charset=utf-8').end(done);
		});

		it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
			this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
		});
	});

	describe('when a valid module, valid system-code and invalid brand is requested', function() {
		const moduleName = '@financial-times/o-test-component@v2.0.0-beta.1';
		const brand = 'origami';
		const systemCode = 'origami';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/bundles/css?modules=${moduleName}&brand=${brand}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(response => {
				proclaim.deepStrictEqual(response.status, 400);
			}).end(done);
		});

		it('should respond with the css', function(done) {
			this.request
				.expect(({text}) => {
					proclaim.deepStrictEqual(text, 'Origami Build Service returned an error: "The brand query parameter must be either `master`, `internal`, or `whitelabel`."');
				}).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
		});

		it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
			this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
		});
	});

	describe('when an invalid module, valid brand and valid system-code is requested', function() {
		const moduleName = 'hello-nonexistent-module@1';
		const brand = 'master';
		const systemCode = 'origami';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/bundles/css?modules=${moduleName}&brand=${brand}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(response => {
				proclaim.deepStrictEqual(response.status, 400);
			}).end(done);
		});

		it('should respond with the css', function(done) {
			this.request.expect(({text}) => {
				proclaim.deepStrictEqual(text,'Origami Build Service returned an error: "hello-nonexistent-module@1 is not in the npm registry"');
			}).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
		});

		it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
			this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
		});
	});

	describe('when an invalid module is requested (nonexistent)', function() {
		const moduleName = 'hello-nonexistent-module@1';
		const brand = 'master';
		const systemCode = 'origami';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/bundles/css?modules=${moduleName}&brand=${brand}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(response => {
				proclaim.deepStrictEqual(response.status, 400);
			}).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
		});

		it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
			this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
		});

	});

	// describe('when an invalid module is requested (Sass compilation error)', function() {
	//     const moduleName = 'o-test-component@1.0.1';

	//     beforeEach(function() {
	//         this.request = request(this.app)
	//             .get(`/v3/bundles/css?modules=${moduleName}`)
	//             .set('Connection', 'close');
	//     });

	//     it('should respond with a 560 status', function(done) {
	//         this.request.expect(560).end(done);
	//     });

	//     it('should respond with an error message', function(done) {
	//         this.request.expect(/cannot complete build due to compilation error from build tools:/i).end(done);
	//     });

	// it('should respond with the expected `Content-Type` header', function(done) {
	//     this.request.expect('Content-Type', 'text/css; charset=utf-8').end(done);
	// });

	// it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
	// 	this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
	// });

	// });

	describe('when the modules parameter is missing', function() {
		const brand = 'master';
		const systemCode = 'origami';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/bundles/css?brand=${brand}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(response => {
				proclaim.deepStrictEqual(response.status, 400);
			}).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect('Origami Build Service returned an error: "The modules query parameter can not be empty."').end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
		});

		it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
			this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
		});

	});

	describe('when the modules parameter is not a string', function() {
		const brand = 'master';
		const systemCode = 'origami';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/bundles/css?modules[]=foo&modules[]=bar&brand=${brand}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(response => {
				proclaim.deepStrictEqual(response.status, 400);
			}).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect('Origami Build Service returned an error: "The modules query parameter must be a string."').end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
		});

		it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
			this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
		});

	});

	describe('when a module name cannot be parsed', function() {
		const moduleName = 'http://1.2.3.4/';
		const brand = 'master';
		const systemCode = 'origami';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/bundles/css?modules=${moduleName}&brand=${brand}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(response => {
				proclaim.deepStrictEqual(response.status, 400);
			}).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect('Origami Build Service returned an error: "The modules query parameter contains module names which are not valid: http://1.2.3.4/."').end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
		});

		it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
			this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
		});

	});

});
