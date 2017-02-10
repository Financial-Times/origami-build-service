'use strict';

const assert = require('chai').assert;
const request = require('supertest');

describe('GET /v2/bundles/css', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module is requested', function() {
		const moduleName = 'o-test-component@1.0.4';

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
			this.request.expect('/** Shrinkwrap URL:\n *    /v2/bundles/css?modules=o-test-component%401.0.4%2Co-autoinit%401.2.1&shrinkwrap=\n */\n#test-compile-error{color:red}').end(done);
		});

		it('should minify the bundle', function(done) {
			this.request.end((error, response) => {
				assert.notInclude(response.text, '/* unminified */');
				done(error);
			});
		});

	});

	describe('when a valid module is requested (with no minification)', function() {
		const moduleName = 'o-test-component@1.0.4';

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
			this.request.expect('/** Shrinkwrap URL:\n *    /v2/bundles/css?modules=o-test-component%401.0.4%2Co-autoinit%401.2.1&shrinkwrap=\n */\n#test-compile-error {\n  color: red; }\n\n/*# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvd2VyX2NvbXBvbmVudHMvby10ZXN0LWNvbXBvbmVudC9tYWluLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7RUFDQyxXQUFXLEVBQ1giLCJmaWxlIjoibWFpbi07LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIlxuI3Rlc3QtY29tcGlsZS1lcnJvciB7XG5cdGNvbG9yOiByZWQ7XG59XG4iXX0= */\n').end(done);
		});

	});

	describe('when an invalid module is requested (nonexistent)', function() {
		const moduleName = 'test-404';

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
		const moduleName = 'o-test-component@1.0.3';

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
				.get('/v2/bundles/css')
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message in a CSS comment', function(done) {
			this.request.expect('/*\n\nThe modules parameter is required and must be a comma-separated list of modules\n\n*/\n').end(done);
		});

	});

	describe('when the modules parameter is not a string', function() {

		beforeEach(function() {
			this.request = request(this.app)
				.get('/v2/bundles/css?modules[]=foo&modules[]=bar')
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message in a CSS comment', function(done) {
			this.request.expect('/*\n\nThe modules parameter is required and must be a comma-separated list of modules\n\n*/\n').end(done);
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
		const moduleName = 'o-test-component@1.0.11';

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
