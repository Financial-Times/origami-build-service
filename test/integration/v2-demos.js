// https://www.ft.com/__origami/service/build/v2/demos/o-buttons@4.5.0/standard

'use strict';

const request = require('supertest');

describe('GET /v2/demos', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module and demo are requested', function() {
		const moduleName = 'o-buttons';
		const pathName = 'standard';

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
			this.request.expect('<!DOCTYPE html>\n<html lang="en" class="o-hoverable-on ">\n<head>\n\t<meta charset="utf-8">\n\t<meta http-equiv="X-UA-Compatible" content="IE=Edge">\n\t<title>o-buttons: standard demo</title>\n\t<meta name="viewport" content="initial-scale=1.0, width=device-width">\n\t<script src="//cdn.polyfill.io/v2/polyfill.min.js?features=default"></script>\n\t<style>body { margin: 0; } .core .o--if-js, .enhanced .o--if-no-js { display: none !important; }</style>\n\t<script>(function(d) { d.className = d.className + \' demo-js\'; })(document.documentElement);</script>\n\t<link rel="stylesheet" href="//www.ft.com/v2/bundles/css?modules=o-buttons%404.5.2%3A%2Fdemos%2Fsrc%2Fdemo.scss%2Co-fonts%40%5E1.4.0">\n</head>\n<body>\n<button class="o-buttons o-buttons--small">Standard</button>\n<button class="o-buttons">Standard</button>\n<button class="o-buttons o-buttons--big">Standard</button>\n\n<script src="//www.ft.com/v2/bundles/js?modules=o-buttons%404.5.2%3A%2Fdemos%2Fsrc%2Fdemo.js%2Co-fonts%40%5E1.4.0"></script>\n<script src="//registry.origami.ft.com/embedapi?autoload=resize"></script>\n</body>\n</html>\n').end(done);
		});

	});

	describe('when a valid module and no demo is requested', function() {
		const moduleName = 'o-buttons';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain;charset=UTF-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('/*\n\nInvalid URL\n\n*/\n').end(done);
		});

	});

	describe('when a valid module and no demo is requested, without ending /', function() {
		const moduleName = 'o-buttons';

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

		it('should respond with the file contents', function(done) {
			this.request.expect('Cannot GET /v2/demos/o-buttons\n').end(done);
		});

	});

	describe('when a valid module at specific version and demo are requested', function() {
		const moduleName = 'o-buttons@4.5.0';
		const pathName = 'standard';

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
			this.request.expect('<!DOCTYPE html>\n<html lang="en" class="o-hoverable-on ">\n<head>\n\t<meta charset="utf-8">\n\t<meta http-equiv="X-UA-Compatible" content="IE=Edge">\n\t<title>o-buttons: standard demo</title>\n\t<meta name="viewport" content="initial-scale=1.0, width=device-width">\n\t<script src="//cdn.polyfill.io/v2/polyfill.min.js?features=default"></script>\n\t<style>body { margin: 0; } .core .o--if-js, .enhanced .o--if-no-js { display: none !important; }</style>\n\t<script>(function(d) { d.className = d.className + \' demo-js\'; })(document.documentElement);</script>\n\t<link rel="stylesheet" href="//www.ft.com/v2/bundles/css?modules=o-buttons%404.5.0%3A%2Fdemos%2Fsrc%2Fdemo.scss%2Co-fonts%40%5E1.4.0">\n</head>\n<body>\n<button class="o-buttons o-buttons--small">Standard</button>\n<button class="o-buttons">Standard</button>\n<button class="o-buttons o-buttons--big">Standard</button>\n\n<script src="//www.ft.com/v2/bundles/js?modules=o-buttons%404.5.0%3A%2Fdemos%2Fsrc%2Fdemo.js%2Co-fonts%40%5E1.4.0"></script>\n<script src="//registry.origami.ft.com/embedapi?autoload=resize"></script>\n</body>\n</html>\n').end(done);
		});

	});

	describe('when a valid module at specific version and demo which contains compilation errors are requested', function() {
		const moduleName = 'o-test-component@1.0.3';
		const pathName = 'standard';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function(done) {
			this.request.expect(560).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain;charset=UTF-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('/*\n\nCannot complete build due to compilation error from build tools:\n\nCouldn\'t find demos config path, checked: origami.json,demos/src/config.js,demos/src/config.json\n\n\n*/\n').end(done);
		});

	});

	describe('when a valid module and non-existent demo are requested', function() {
		const moduleName = 'o-buttons';
		const pathName = 'NOTADEMO';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function(done) {
			this.request.expect(560).end(done);
		});

		it('should respond with an error message in a comment', function(done) {
			this.request.expect('/*\n\nCannot complete build due to compilation error from build tools:\n\nNo demos were found for NOTADEMO.\n\n\n*/\n').end(done);
		});

	});

	describe('when a valid module at specific version but non-existent demo are requested', function() {
		const moduleName = 'o-buttons@4.5.0';
		const pathName = 'NOTADEMO';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function(done) {
			this.request.expect(560).end(done);
		});

		it('should respond with an error message in a comment', function(done) {
			this.request.expect('/*\n\nCannot complete build due to compilation error from build tools:\n\nNo demos were found for NOTADEMO.\n\n\n*/\n').end(done);
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

		it('should respond with an error message in a comment', function(done) {
			this.request.expect('/*\n\nPackage non-existent-module not found\n\n{\n  "endpoint": {\n    "name": "non-existent-module",\n    "source": "non-existent-module",\n    "target": "*"\n  }\n}\n\n*/\n').end(done);
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

		it('should respond with an error message in a comment', function(done) {
			this.request.expect('/*\n\nPackage non-existent-module not found\n\n{\n  "endpoint": {\n    "name": "non-existent-module",\n    "source": "non-existent-module",\n    "target": "1.0.0"\n  }\n}\n\n*/\n').end(done);
		});

	});

	describe('when a valid module at non-existent version is requested', function() {
		const moduleName = 'o-buttons@99.0.0';
		const pathName = 'standard';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message in a comment', function(done) {
			this.request.expect('/*\n\nNo tag found that was able to satisfy 99.0.0\nAvailable versions: 4.5.2, 4.5.1, 4.5.0, 4.4.4, 4.4.3, 4.4.2, 4.4.1, 4.4.0, 4.3.1, 4.3.0, 4.2.0, 4.1.1, 4.1.0, 4.0.2, 4.0.1, 4.0.0, 3.1.4, 3.1.3, 3.1.2, 3.1.1, 3.1.0, 3.0.3, 3.0.2, 3.0.1, 3.0.1-beta.1, 3.0.0, 3.0.0-beta.7, 3.0.0-beta.6, 3.0.0-beta.5, 3.0.0-beta.4, 3.0.0-beta.3, 3.0.0-beta.2, 3.0.0-beta.1, 2.0.4, 2.0.3, 2.0.2, 2.0.1, 2.0.0, 1.8.1, 1.8.0, 1.7.5, 1.7.4, 1.7.3, 1.7.2, 1.7.1, 1.7.0, 1.6.0, 1.5.4, 1.5.3, 1.5.2, 1.5.1, 1.5.0, 1.4.1, 1.4.0, 1.3.0, 1.2.0, 1.1.1, 1.1.0, 1.0.6, 1.0.5, 1.0.4, 1.0.3, 1.0.2, 1.0.1, 1.0.0, 0.2.0, 0.1.6, 0.1.5, 0.1.4, 0.1.3, 0.1.2, 0.1.1, 0.1.0\n\n{\n  "endpoint": {\n    "name": "o-buttons",\n    "source": "o-buttons",\n    "target": "99.0.0"\n  },\n  "resolver": {\n    "name": "o-buttons",\n    "source": "https://github.com/Financial-Times/o-buttons.git",\n    "target": "99.0.0"\n  }\n}\n\n*/\n').end(done);
		});

	});

});
