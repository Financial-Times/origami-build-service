'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /v3/demo', function() {
	this.timeout(60000);
	this.slow(5000);

	describe('when a valid component and demo are requested', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('should respond with the built demo', function(done) {
			this.request.expect((response) => {
				assert.matchSnapshot(response.text);
			}).end(done);
		});

	});

	describe('when a valid component with no demos is requested', function() {
		const component = '@financial-times/o-test-component@2.0.7';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function(done) {
				this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
				this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
			});
		});

		it('should respond with an error message', function(done) {
			this.request.expect('Origami Build Service returned an error: "@financial-times/o-test-component@2.0.7 has no demos defined within it\'s origami.json file. See the component specification for details on how to configure demos for a component: https://origami.ft.com/spec/"').end(done);
		});

	});

	describe('when a valid component at specific version and demo are requested', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('should respond with the built demo', function(done) {
			this.request.expect((response) => {
				assert.matchSnapshot(response.text);
			}).end(done);
		});

	});

	describe('when a valid component at specific version and demo and brand are requested', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'internal';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('should respond with the built demo', function(done) {
			this.request.expect((response) => {
				assert.matchSnapshot(response.text);
			}).end(done);
		});

	});

	describe('when a valid component at specific version and demo which contains mustache compilation errors are requested', function() {
		const component = '@financial-times/o-test-component@2.0.10';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function(done) {
				this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
				this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
			});
		});

		it('should respond with an error message', function(done) {
			this.request.expect('Origami Build Service returned an error: "@financial-times/o-test-component@2.0.10\'s demo named \\"test-demo\\" could not be built due to a compilation error within the Mustache templates: Unclosed section \\"causing-syntax-error-by-not-closing-section\\" at 126"').end(done);
		});

	});

	describe('when a valid component at specific version and demo which contains sass compilation errors are requested', function() {
		const component = '@financial-times/o-test-component@2.0.11';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function(done) {
				this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
				this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
			});
		});

		it('should respond with an error message', function(done) {
			this.request.expect(response => {
				const body = response.text;
				assert.include(body, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.0.11\'s demo named \\"test-demo\\" could not be built due to a compilation error within the Sass: Error: ');
			}).end(done);
		});

	});

	describe('when a valid component at specific version and demo which contains javascript compilation errors are requested', function() {
		const component = '@financial-times/o-test-component@2.0.12';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function(done) {
				this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
				this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
			});
		});

		it('should respond with an error message', function(done) {
			this.request.expect(response => {
				const body = response.text;
				assert.include(body, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.0.12\'s demo named \\"test-demo\\" could not be built due to a compilation error within the JavaScript: ');
			}).end(done);
		});

	});

	describe('when a valid component and non-existent demo are requested', function() {
		const component = '@financial-times/o-test-component@v2.0.1';
		const demo = 'NOTADEMO';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect('Origami Build Service returned an error: "@financial-times/o-test-component@v2.0.1 has no demo with the requested name: NOTADEMO"').end(done);
		});

	});

	describe('when a valid component at specific version but non-existent demo are requested', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'NOTADEMO';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect('Origami Build Service returned an error: "@financial-times/o-test-component@2.0.1 has no demo with the requested name: NOTADEMO"').end(done);
		});

	});

	describe('when a valid component at non-existent version is requested', function() {
		const component = '@financial-times/o-test-component@99.0.0';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect('Origami Build Service returned an error: "@financial-times/o-test-component@99.0.0 is not in the npm registry"').end(done);
		});

	});

	describe('when a non origami component is requested', function() {
		const component = 'jquery@3.0.0';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The module query parameter can only contain modules from the @financial-times namespace. The module being requested was: jquery."')
				.end(done);
		});
	});

	describe('when a valid component which does not have an origami manifest is requested', function() {
		const component = '@financial-times/o-test-component@2.0.13';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "@financial-times/o-test-component@2.0.13 is not an Origami v2 component, the Origami Build Service v3 API only supports Origami v2 components."')
				.end(done);
		});
	});

	describe('when an origami specification v1 component is requested', function() {
		const component = '@financial-times/o-test-component@1.0.0';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "@financial-times/o-test-component@1.0.0 is not an Origami v2 component, the Origami Build Service v3 API only supports Origami v2 components."')
				.end(done);
		});
	});

	describe('when the request is missing the brand parameter', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'test-demo';
		const system_code = 'origami';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The brand query parameter must be a string. Either `master`, `internal`, or `whitelabel`."')
				.end(done);
		});
	});
	describe('when the request contains an invalid brand parameter', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'denshiba';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The brand query parameter must be either `master`, `internal`, or `whitelabel`."')
				.end(done);
		});
	});
	describe('when the request is missing the demo parameter', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The demo query parameter must be a string."')
				.end(done);
		});
	});
	describe('when the request contains an invalid demo parameter', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo[]=foo&demo[]=bar&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The demo query parameter must be a string."')
				.end(done);
		});
	});
	describe('when the request is missing the system_code parameter', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'test-demo';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The system_code query parameter must be a string."')
				.end(done);
		});
	});
	describe('when the request contains an invalid system_code parameter', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'test-demo';
		const system_code = 'not_a_system_code_137';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The system_code query parameter must be a valid Biz-Ops System Code."')
				.end(done);
		});
	});
	describe('when the request is missing the module parameter', function() {
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The module query parameter must be a string."')
				.end(done);
		});
	});
	describe('when the request contains an invalid module parameter', function() {
		const component = 'not:a^valid@module';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The module query parameter can only contain modules from the @financial-times namespace. The module being requested was: not:a^valid."')
				.end(done);
		});
	});

});
