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
		const moduleName = 'o-test-component@v1.0.30';
		const pathName = 'main';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('<div class="o-test-component-brand"></div>\n').end(done);
		});

	});
	describe('when a valid module and demo are requested with a valid semver range', function() {
		const moduleName = 'o-test-component@>=1.0.30 <1.0.31';
		const pathName = 'main';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('<div class="o-test-component-brand"></div>\n').end(done);
		});

	});

	describe('when a valid module and no demo is requested', function() {
		const moduleName = 'o-test-component@v1.0.30';

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
		const moduleName = 'o-test-component@v1.0.30';

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
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('<div></div>\n').end(done);
		});

	});

	describe('when a valid module at specific version and demo and brand are requested', function() {
		const moduleName = 'o-test-component@1.0.19';
		const pathName = 'main';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html?brand=internal`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('<div></div>\n').end(done);
		});

	});

	describe('when a valid module at specific version and demo which contains compilation errors are requested', function() {
		const moduleName = 'o-test-component@1.0.8';
		const pathName = 'main';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
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
		const moduleName = 'o-test-component@v1.0.30';
		const pathName = 'NOTADEMO';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
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
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
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
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
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
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
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
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
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

	describe('when a valid module and demo are requested with a git commit hash', function () {
		const moduleName = 'o-test-component@3efec8933c0dd75b13231ce73c5336394742255b';
		const pathName = 'main';

		beforeEach(function () {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function (done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function (done) {
			this.request
				.expect(({ text }) => {
					assert.equal(getErrorMessage(text), 'Demos may only be built for components which have been released with a valid semver version number.');
				})
				.end(done);
		});
	});

	describe('when a valid module and demo are requested with an invalid semver version', function () {
		const moduleName = 'o-test-component@v1.0.0$';
		const pathName = 'main';

		beforeEach(function () {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function (done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function (done) {
			this.request
				.expect(({ text }) => {
					assert.equal(getErrorMessage(text), 'Demos may only be built for components which have been released with a valid semver version number.');
				})
				.end(done);
		});
	});

	describe('when an origami specification v2 component is requested', function() {
		const moduleName = 'o-test-component@2.0.0-beta.1';
		const pathName = 'main';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect(({text}) => {
					assert.equal(getErrorMessage(text), 'o-test-component@2.0.0-beta.1 is an Origami v2 component, the Origami Build Service v2 CSS API only supports Origami v1 components.\n\nIf you want to use Origami v2 components you will need to use the Origami Build Service v3 API');
				})
				.end(done);
		});
	});

});
