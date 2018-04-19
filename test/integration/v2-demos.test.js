'use strict';

const request = require('supertest');
const {assert} = require('chai');
const cheerio = require('cheerio');

const getErrorMessage = (text) => {
	const $ = cheerio.load(text);
	return $('[data-test-id="error-message"]').text();
};

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
			this.request.expect('<!DOCTYPE html>\n<html lang="en" class="o-hoverable-on ">\n<head>\n\t<meta charset="utf-8">\n\t<meta http-equiv="X-UA-Compatible" content="IE=Edge">\n\t<title>o-test-component: main demo</title>\n\t<meta name="viewport" content="initial-scale=1.0, width=device-width">\n\t<script src="//cdn.polyfill.io/v2/polyfill.min.js?features=default"></script>\n\t<style>body { margin: 0; } .core .o--if-js, .enhanced .o--if-no-js { display: none !important; }</style>\n\t<script>(function(d) { d.className = d.className + \' demo-js\'; })(document.documentElement);</script>\n\t<link rel="stylesheet" href="//www.ft.com/__origami/service/build/v2/bundles/css?modules=o-test-component%401.0.30%3A%2Fdemos%2Fsrc%2Fdemo.scss">\n</head>\n<body>\n<div class="o-test-component-brand"></div>\n\n<script src="//www.ft.com/__origami/service/build/v2/bundles/js?modules="></script>\n<script src="//registry.origami.ft.com/embedapi?autoload=resize"></script>\n</body>\n</html>').end(done);
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
			this.request.expect((response) => {
				assert.match(getErrorMessage(response.text), /not found/i);
			}).end(done);
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
			this.request.expect(({text}) => {
				assert.match(getErrorMessage(text), /not found/i);
			}).end(done);
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
			this.request.expect('<!DOCTYPE html>\n<html lang="en" class="o-hoverable-on ">\n<head>\n\t<meta charset="utf-8">\n\t<meta http-equiv="X-UA-Compatible" content="IE=Edge">\n\t<title>test-component: main demo</title>\n\t<meta name="viewport" content="initial-scale=1.0, width=device-width">\n\t<script src="//cdn.polyfill.io/v2/polyfill.min.js?features=default"></script>\n\t<style>body { margin: 0; } .core .o--if-js, .enhanced .o--if-no-js { display: none !important; }</style>\n\t<script>(function(d) { d.className = d.className + \' demo-js\'; })(document.documentElement);</script>\n\t<link rel="stylesheet" href="//www.ft.com/__origami/service/build/v2/bundles/css?modules=">\n</head>\n<body>\n<div>\n</div>\n\n<script src="//www.ft.com/__origami/service/build/v2/bundles/js?modules="></script>\n<script src="//registry.origami.ft.com/embedapi?autoload=resize"></script>\n</body>\n</html>\n').end(done);
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
			this.request.expect(({text}) => {
				assert.match(getErrorMessage(text), /cannot complete build due to compilation error from build tools:/i);
			}).end(done);
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
			this.request.expect(({text}) => {
				assert.match(getErrorMessage(text), /no demos were found for notademo/i);
			}).end(done);
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
			this.request.expect(({text}) => {
				assert.match(getErrorMessage(text), /no demos were found for notademo/i);
			}).end(done);
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
			this.request.expect(({text}) => {
				assert.match(getErrorMessage(text), /no tag found that was able to satisfy 99.0.0/i);
			}).end(done);
		});

	});

	describe('when a valid module on the main bower registry is requested', function() {
		const moduleName = 'jquery@3.0.0';
		const pathName = 'main';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect(({text}) => {
					assert.equal(getErrorMessage(text), 'The modules parameter contains module names which are not on the FT bower registry: \n\t- jquery');
				})
				.end(done);
		});
	});

	describe('when a valid module which does not have an origami manifest is requested', function() {
		const moduleName = 'o-test-component@1.0.0';
		const pathName = 'main';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect(({text}) => {
					assert.equal(getErrorMessage(text), 'The modules parameter contains module names which are not origami modules: \n\t- o-test-component');
				})
				.end(done);
		});
	});

});
