'use strict';

const assert = require('chai').assert;
const request = require('supertest');

describe('GET /v2/bundles/js', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module is requested', function() {
		const moduleName = 'o-test-component@1.0.2';

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
			this.request.expect('/** Shrinkwrap URL:\n *      /v2/bundles/js?modules=o-test-component%401.0.2%2Co-autoinit%401.3.2&shrinkwrap=\n */\n!function(t){function e(o){if(n[o])return n[o].exports;var d=n[o]={i:o,l:!1,exports:{}};return t[o].call(d.exports,d,d.exports,e),d.l=!0,d.exports}var n={};e.m=t,e.c=n,e.d=function(t,n,o){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:o})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=0)}([function(t,e,n){"use strict";n(1),window.Origami={"o-test-component":n(2),"o-autoinit":n(3)}},function(t,e){t.exports={name:"__MAIN__",dependencies:{"o-test-component":"o-test-component#1.0.2","o-autoinit":"o-autoinit#^1.0.0"}}},function(t,e,n){"use strict";console.log("what is this?")},function(t,e,n){"use strict";function o(t){t in d||(d[t]=!0,document.dispatchEvent(new CustomEvent("o."+t)))}var d={};if(window.addEventListener("load",o.bind(null,"load")),window.addEventListener("load",o.bind(null,"DOMContentLoaded")),document.addEventListener("DOMContentLoaded",o.bind(null,"DOMContentLoaded")),document.onreadystatechange=function(){"complete"===document.readyState?(o("DOMContentLoaded"),o("load")):"interactive"!==document.readyState||document.attachEvent||o("DOMContentLoaded")},"complete"===document.readyState?(o("DOMContentLoaded"),o("load")):"interactive"!==document.readyState||document.attachEvent||o("DOMContentLoaded"),document.attachEvent){var a=!1,c=50;try{a=null===window.frameElement&&document.documentElement}catch(t){}a&&a.doScroll&&function t(){if(!("DOMContentLoaded"in d)){try{a.doScroll("left")}catch(e){return c<5e3?setTimeout(t,c*=1.2):void 0}o("DOMContentLoaded")}}()}}]);').end(done);
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
		const moduleName = 'o-test-component@1.0.2';

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
			this.request.expect(/ sourceMappingURL=data:application\/json;charset=utf-8;base64,/i).end(done);
		});

	});

	describe('when a valid module is requested (with the `autoinit` parameter set to `0`)', function() {
		const moduleName = 'o-test-component@1.0.2';

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
			this.request.expect('/** Shrinkwrap URL:\n *      /v2/bundles/js?modules=o-test-component%401.0.2&shrinkwrap=\n */\n!function(t){function n(o){if(e[o])return e[o].exports;var r=e[o]={i:o,l:!1,exports:{}};return t[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}var e={};n.m=t,n.c=e,n.d=function(t,e,o){n.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:o})},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},n.p="",n(n.s=0)}([function(t,n,e){"use strict";e(1),window.Origami={"o-test-component":e(2)}},function(t,n){t.exports={name:"__MAIN__",dependencies:{"o-test-component":"o-test-component#1.0.2"}}},function(t,n,e){"use strict";console.log("what is this?")}]);').end(done);
		});

	});

	describe('when a valid module is requested (with the `export` parameter set to `foo`)', function() {
		const moduleName = 'o-test-component@1.0.2';

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
		const moduleName = 'o-test-component@1.0.2';

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
		const moduleName = 'o-test-component@1.0.2';

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
		/**
		 * We need to request a module which uses features which will trigger Babel to include the polyfill set.
		 */
		const moduleName = 'o-test-component@1.0.16';

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
			this.request.expect(/__core-js_shared__/).end(done); // Fragile check which depends on core-js source code
		});

	});

	describe('when an invalid module is requested (nonexistent)', function() {
		const moduleName = 'test-404';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(/package .* not found/i).end(done);
		});

	});

	describe('when an invalid module is requested (JavaScript compilation error)', function() {
		const moduleName = 'o-test-component@1.0.1';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function(done) {
			this.request.expect(560).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(/cannot complete build due to compilation error from build tools:/i).end(done);
		});

	});

	describe('when the modules parameter is missing', function() {

		beforeEach(function() {
			this.request = request(this.app)
				.get('/v2/bundles/js')
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(/the modules parameter is required and must be a comma-separated list of modules/i).end(done);
		});

	});

	describe('when the modules parameter is not a string', function() {

		beforeEach(function() {
			this.request = request(this.app)
				.get('/v2/bundles/js?modules[]=foo&modules[]=bar')
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(/the modules parameter is required and must be a comma-separated list of modules/i).end(done);
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

		it('should respond with an error message', function(done) {
			this.request.expect(/The modules parameter contains module names which are not valid: http:\/\/1.2.3.4\//i).end(done);
		});

	});

	describe('when the bundle type is invalid', function() {
		const moduleName = 'o-test-component@1.0.11';

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

describe('when a module name is a relative directory', function() {
		const moduleName = '../../../example';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message ', function(done) {
			this.request.expect(/The modules parameter contains module names which are not valid: \.\.\/\.\.\/\.\.\/example/i).end(done);
		});

});
