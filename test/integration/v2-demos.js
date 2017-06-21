'use strict';

const request = require('supertest');

describe('GET /v2/demos', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module and demo are requested', function() {
		const moduleName = 'o-test-component';
		const pathName = 'main';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html;charset=UTF-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('<!DOCTYPE html>\n<html lang="en" class="o-hoverable-on ">\n<head>\n\t<meta charset="utf-8">\n\t<meta http-equiv="X-UA-Compatible" content="IE=Edge">\n\t<title>test-component: main demo</title>\n\t<meta name="viewport" content="initial-scale=1.0, width=device-width">\n\t<script src="//cdn.polyfill.io/v2/polyfill.min.js?features=default"></script>\n\t<style>body { margin: 0; } .core .o--if-js, .enhanced .o--if-no-js { display: none !important; }</style>\n\t<script>(function(d) { d.className = d.className + \' demo-js\'; })(document.documentElement);</script>\n\t<link rel="stylesheet" href="//www.ft.com/v2/bundles/css?modules=">\n</head>\n<body>\n<div>\n</div>\n\n<script src="//www.ft.com/v2/bundles/js?modules="></script>\n<script src="//registry.origami.ft.com/embedapi?autoload=resize"></script>\n</body>\n</html>\n').end(done);
		});

	});

	describe('when a valid module and no demo is requested', function() {
		const moduleName = 'o-test-component';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(/not found/i).end(done);
		});

	});

	describe('when a valid module and no demo is requested, without ending /', function() {
		const moduleName = 'o-test-component';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(/not found/i).end(done);
		});

	});

	describe('when a valid module at specific version and demo are requested', function() {
		const moduleName = 'o-test-component@1.0.19';
		const pathName = 'main';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html;charset=UTF-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('<!DOCTYPE html>\n<html lang="en" class="o-hoverable-on ">\n<head>\n\t<meta charset="utf-8">\n\t<meta http-equiv="X-UA-Compatible" content="IE=Edge">\n\t<title>test-component: main demo</title>\n\t<meta name="viewport" content="initial-scale=1.0, width=device-width">\n\t<script src="//cdn.polyfill.io/v2/polyfill.min.js?features=default"></script>\n\t<style>body { margin: 0; } .core .o--if-js, .enhanced .o--if-no-js { display: none !important; }</style>\n\t<script>(function(d) { d.className = d.className + \' demo-js\'; })(document.documentElement);</script>\n\t<link rel="stylesheet" href="//www.ft.com/v2/bundles/css?modules=">\n</head>\n<body>\n<div>\n</div>\n\n<script src="//www.ft.com/v2/bundles/js?modules="></script>\n<script src="//registry.origami.ft.com/embedapi?autoload=resize"></script>\n</body>\n</html>\n').end(done);
		});

	});

	describe('when a valid module at specific version and demo which contains compilation errors are requested', function() {
		const moduleName = 'o-test-component@1.0.8';
		const pathName = 'main';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function(done) {
			this.request.expect(560).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(/cannot complete build due to compilation error from build tools:/i).end(done);
		});

	});

	describe('when a valid module and non-existent demo are requested', function() {
		const moduleName = 'o-test-component';
		const pathName = 'NOTADEMO';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function(done) {
			this.request.expect(560).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(/no demos were found for notademo/i).end(done);
		});

	});

	describe('when a valid module at specific version but non-existent demo are requested', function() {
		const moduleName = 'o-test-component@1.0.19';
		const pathName = 'NOTADEMO';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function(done) {
			this.request.expect(560).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(/no demos were found for notademo/i).end(done);
		});

	});

	describe('when an non-existent module is requested', function() {
		const moduleName = 'non-existent-module';
		const pathName = 'README.md';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(/package non-existent-module not found/i).end(done);
		});

	});

	describe('when an invalid module (non-existent) at specific version is requested', function() {
		const moduleName = 'non-existent-module@1.0.0';
		const pathName = 'README.md';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(/package non-existent-module not found/i).end(done);
		});

	});

	describe('when a valid module at non-existent version is requested', function() {
		const moduleName = 'o-test-component@99.0.0';
		const pathName = 'main';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(/no tag found that was able to satisfy 99.0.0/i).end(done);
		});

	});

});