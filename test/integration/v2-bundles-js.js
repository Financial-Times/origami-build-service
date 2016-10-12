'use strict';

const assert = require('chai').assert;
const request = require('supertest');

describe('GET /v2/bundles/js', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module is requested', function() {
		const moduleName = 'mock-modules/test-ok';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the bundled JavaScript', function(done) {
			this.request.expect(/^\/\*\* Shrinkwrap URL:\n \*      \/v2\/bundles\/js\?modules=mock-modules%2Ftest-ok%2Co-autoinit%401.2.0&shrinkwrap=mock-modules%2Ftest-dependency\n \*\//i).end(done);
		});

		it('should minify the bundle', function(done) {
			this.request.end((error, response) => {
				assert.notInclude(response.text, '// unminified');
				done(error);
			});
		});

		it('should export the bundle under `window.Origami`', function(done) {
			this.request.expect(/window\.Origami/).end(done);
		});

	});

	describe('when a valid module is requested (with the `minify` parameter set to `none`)', function() {
		const moduleName = 'mock-modules/test-ok';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}&minify=none`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the bundled JavaScript unminified', function(done) {
			this.request.expect(/\/\/ unminified/i).end(done);
		});

	});

	describe('when a valid module is requested (with the `autoinit` parameter set to `0`)', function() {
		const moduleName = 'mock-modules/test-ok';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}&autoinit=0`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the bundled JavaScript without the o-autoinit module', function(done) {
			this.request.expect(/^\/\*\* Shrinkwrap URL:\n \*      \/v2\/bundles\/js\?modules=mock-modules%2Ftest-ok&shrinkwrap=mock-modules%2Ftest-dependency\n \*\//i).end(done);
		});

	});

	describe('when a valid module is requested (with the `export` parameter set to `foo`)', function() {
		const moduleName = 'mock-modules/test-ok';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}&export=foo`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should export the bundle under `window.foo`', function(done) {
			this.request.expect(/window\.foo/).end(done);
		});

	});

	describe('when a valid module is requested (with the `export` parameter set to an empty string)', function() {
		const moduleName = 'mock-modules/test-ok';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}&export=`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should not export the bundle onto `window`', function(done) {
			this.request.end((error, response) => {
				assert.notInclude(response.text, 'window.Origami');
				done(error);
			});
		});

	});

	describe('when a valid module is requested (with the `polyfills` parameter set to `none`)', function() {
		const moduleName = 'mock-modules/test-ok';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}&polyfills=none&minify=none`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the bundled JavaScript with no polyfills', function(done) {
			this.request.expect(function(response) {
				assert.notMatch(response.text, /Array\.isArray/);
			}).end(done);
		});

	});

	describe('when a valid module is requested (with the `polyfills` parameter set to `true`)', function() {
		const moduleName = 'mock-modules/test-ok';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}&polyfills=true&minify=none`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the bundled JavaScript containing polyfills', function(done) {
			this.request.expect(/Array\.isArray/).end(done);
		});

	});

	describe('when an invalid module is requested (nonexistent)', function() {
		const moduleName = 'mock-modules/test-404';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message in a JavaScript comment', function(done) {
			this.request.expect(/^\/\*\n\nPackage .* not found/i).end(done);
		});

	});

	describe('when an invalid module is requested (JavaScript compilation error)', function() {
		const moduleName = 'mock-modules/test-compile-error';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function(done) {
			this.request.expect(560).end(done);
		});

		it('should respond with an error message in a JavaScript comment', function(done) {
			this.request.expect(/^\/\*\n\ncannot complete build due to compilation error from build tools:/i).end(done);
		});

	});

	describe('when the modules parameter is missing', function() {

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/bundles/js`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message in a JavaScript comment', function(done) {
			this.request.expect('/*\n\nMissing \'modules\' query argument\n\n*/\n').end(done);
		});

	});

	describe('when the modules parameter is not a string', function() {

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/bundles/js?modules[]=foo&modules[]=bar`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message in a JavaScript comment', function(done) {
			this.request.expect('/*\n\nThe \'modules\' query argument must be a comma-separated list of modules\n\n*/\n').end(done);
		});

	});

	describe('when a module name cannot be parsed', function() {
		const moduleName = 'http://1.2.3.4/';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message in a JavaScript comment', function(done) {
			this.request.expect(/unable to parse module name/i).end(done);
		});

	});

	describe('when the bundle type is invalid', function() {
		const moduleName = 'mock-modules/test-ok';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/javascript?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

	});

});
