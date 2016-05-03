'use strict';

const assert = require('chai').assert;
const request = require('supertest');

describe('GET /v2/bundles/css', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module is requested', function() {
		const moduleName = 'mock-modules/test-ok';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the bundled CSS', function(done) {
			this.request.expect(`/** Shrinkwrap URL:\n *    /v2/bundles/css?modules=mock-modules%2Ftest-ok%2Co-autoinit%401.2.0&shrinkwrap=mock-modules%2Ftest-dependency\n */\n#test-ok{hello:world}#test-dependency{dependency:true}`).end(done);
		});

		it('should minify the bundle', function(done) {
			this.request.end((error, response) => {
				assert.notInclude(response.text, '/* unminified */');
				done(error);
			});
		});

	});

	describe('when a valid module is requested (with no minification)', function() {
		const moduleName = 'mock-modules/test-ok';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}&minify=none`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the bundled CSS unminified', function(done) {
			this.request.expect(/\/\* unminified \*\//i).end(done);
		});

	});

	describe('when an invalid module is requested (nonexistent)', function() {
		const moduleName = 'mock-modules/test-404';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message in a CSS comment', function(done) {
			this.request.expect(/^\/\*\n\nPackage .* not found/i).end(done);
		});

	});

	describe('when an invalid module is requested (Sass compilation error)', function() {
		const moduleName = 'mock-modules/test-compile-error';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function(done) {
			this.request.expect(560).end(done);
		});

		it('should respond with an error message in a CSS comment', function(done) {
			this.request.expect(/^\/\*\n\ncannot complete build due to compilation error from build tools:/i).end(done);
		});

	});

	describe('when the modules parameter is missing', function() {

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/bundles/css`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message in a CSS comment', function(done) {
			this.request.expect('/*\n\nMissing \'modules\' query argument\n\n*/\n').end(done);
		});

	});

	describe('when a module name cannot be parsed', function() {
		const moduleName = 'http://1.2.3.4/';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message in a CSS comment', function(done) {
			this.request.expect(/unable to parse module name/i).end(done);
		});

	});

	describe('when the bundle type is invalid', function() {
		const moduleName = 'mock-modules/test-ok';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/CSS?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

	});

});
