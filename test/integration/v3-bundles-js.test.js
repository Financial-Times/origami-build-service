'use strict';

const proclaim = require('proclaim');
const request = require('supertest');
const jsdom = require('jsdom');
const getEcmaVersion = require('detect-es-version').getEcmaVersion;
const vm = require('vm');
const sinon = require('sinon');

const { JSDOM } = jsdom;

const createWindow = () => new JSDOM('', {
    runScripts: 'dangerously'
}).window;

const executeScript = (script, givenWindow) => {
    let internalWindowError;
    const window = typeof givenWindow !== 'undefined' ? givenWindow : createWindow();

    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = script;
    window.onerror = error => {
        internalWindowError = error;
        throw error;
    };
    window.document.body.appendChild(scriptEl);
    if (internalWindowError) {
        throw internalWindowError;
    }
    return window;
};

describe('GET /v3/bundles/js', function() {
    this.timeout(20000);
    this.slow(5000);

    describe('when a valid module is requested', function() {
        const moduleName = '@financial-times/o-utils@1.1.7';
        const system = 'origami-build-service';

        beforeEach(function() {
            this.request = request(this.app)
                .get(`/v3/bundles/js?modules=${moduleName}&system_code=${system}`)
                .set('Connection', 'close');
        });

        it('should respond with a 200 status', function(done) {
            this.request.expect(200).end(done);
        });

        it('should respond with the bundled JavaScript', function(done) {
            this.request
                .expect(({ text }) => {
                    proclaim.doesNotThrow(() => executeScript(text));
                })
                .end(done);
        });

        it('should export the bundle under `Origami` global variable', function(done) {
            this.request
                .expect(({text}) => {
                    let resultWindow;
                    proclaim.doesNotThrow(() => {
                        resultWindow = executeScript(text);
                    });
                    proclaim.include(resultWindow, 'Origami');
                    proclaim.include(resultWindow.Origami, '@financial-times/o-utils');
                })
                .end(done);
        });

        it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'application/javascript; charset=utf-8').end(done);
		});

    });

    describe('when an invalid module is requested (nonexistent)', function() {
        const moduleName = 'hello-nonexistent-module@1';
        const system = 'origami-build-service';

        beforeEach(function() {
            this.request = request(this.app)
                .get(`/v3/bundles/js?modules=${moduleName}&system_code=${system}`)
                .set('Connection', 'close');
        });

        it('should respond with a 400 status', function(done) {
            this.request.expect(400).end(done);
        });

        it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'application/javascript; charset=utf-8').end(done);
		});

    });

    // describe('when an invalid module is requested (JavaScript compilation error)', function() {
    //     const moduleName = 'o-test-component@1.0.1';

    //     beforeEach(function() {
    //         this.request = request(this.app)
    //             .get(`/v3/bundles/js?modules=${moduleName}`)
    //             .set('Connection', 'close');
    //     });

    //     it('should respond with a 560 status', function(done) {
    //         this.request.expect(560).end(done);
    //     });

    //     it('should respond with an error message', function(done) {
    //         this.request.expect(/cannot complete build due to compilation error from build tools:/i).end(done);
    //     });

    // it('should respond with the expected `Content-Type` header', function(done) {
    //     this.request.expect('Content-Type', 'application/javascript; charset=utf-8').end(done);
    // });

    // });

    describe('when the modules parameter is missing', function() {
        const system = 'origami-build-service';

        beforeEach(function() {
            this.request = request(this.app)
                .get(`/v3/bundles/js?system_code=${system}`)
                .set('Connection', 'close');
        });

        it('should respond with a 400 status', function(done) {
            this.request.expect(400).end(done);
        });

        it('should respond with an error message', function(done) {
            this.request.expect('throw new Error("Origami Build Service returned an error: The modules query parameter can not be empty.")').end(done);
        });

        it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'application/javascript; charset=utf-8').end(done);
		});

    });

    describe('when the modules parameter is not a string', function() {
        const system = 'origami-build-service';

        beforeEach(function() {
            this.request = request(this.app)
                .get(`/v3/bundles/js?modules[]=foo&modules[]=bar&system_code=${system}`)
                .set('Connection', 'close');
        });

        it('should respond with a 400 status', function(done) {
            this.request.expect(400).end(done);
        });

        it('should respond with an error message', function(done) {
            this.request.expect('throw new Error("Origami Build Service returned an error: The modules query parameter must be a string.")').end(done);
        });

        it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'application/javascript; charset=utf-8').end(done);
		});

    });

    describe('when a module name cannot be parsed', function() {
        const moduleName = 'http://1.2.3.4/';
        const system = 'origami-build-service';

        beforeEach(function() {
            this.request = request(this.app)
                .get(`/v3/bundles/js?modules=${moduleName}&system_code=${system}`)
                .set('Connection', 'close');
        });

        it('should respond with a 400 status', function(done) {
            this.request.expect(400).end(done);
        });

        it('should respond with an error message', function(done) {
            this.request.expect(({text}) => {
                proclaim.deepStrictEqual(text, 'throw new Error("Origami Build Service returned an error: The modules query parameter contains module names which are not valid: http://1.2.3.4/.")');
            }).end(done);
        });

        it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'application/javascript; charset=utf-8').end(done);
		});
    });

    describe('when the callback parameter is an invalid value', function() {
        const moduleName = '@financial-times/o-utils@1.1.7';
        const callback = 'console.log("you got hacked!");//';
        const system = 'origami-build-service';

        beforeEach(function() {
            this.request = request(this.app)
                .get(`/v3/bundles/js?modules=${moduleName}&callback=${callback}&system_code=${system}`)
                .set('Connection', 'close');
        });

        it('should respond with a 400 status', function(done) {
            this.request.expect(400).end(done);
        });

        it('should respond with an error message', function(done) {
            this.request.expect(({text}) => {
                proclaim.deepStrictEqual(text, 'throw new Error("Origami Build Service returned an error: The callback query parameter must be a valid name for a JavaScript variable or function.")');
            }).end(done);
        });

        it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'application/javascript; charset=utf-8').end(done);
		});

    });

    describe('when the callback parameter is a valid value', function() {
        const moduleName = '@financial-times/o-utils@1.1.7';
        const callback = 'start_app';
        const system = 'origami-build-service';

        beforeEach(function() {
            this.request = request(this.app)
                .get(`/v3/bundles/js?modules=${moduleName}&callback=${callback}&system_code=${system}`)
                .set('Connection', 'close');
        });

        it('should respond with a 200 status', function(done) {
            this.request.expect(200).end(done);
        });

        it('should respond with the bundled JavaScript and call the callback with the requrested components', function(done) {
            this.request.expect(({text}) => {
                // proclaim.deepStrictEqual(text, '(function(){"use strict";function T(e,n){var t;if(typeof Symbol=="undefined"||e[Symbol.iterator]==null){if(Array.isArray(e)||(t=A(e))||n&&e&&typeof e.length=="number"){t&&(e=t);var c=0,b=function(){};return{s:b,n:function(){return c>=e.length?{done:!0}:{done:!1,value:e[c++]}},e:function(a){throw a},f:b}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var d=!0,v=!1,g;return{s:function(){t=e[Symbol.iterator]()},n:function(){var a=t.next();return d=a.done,a},e:function(a){v=!0,g=a},f:function(){try{!d&&t.return!=null&&t.return()}finally{if(v)throw g}}}}function A(e,n){if(!e)return;if(typeof e=="string")return j(e,n);var t=Object.prototype.toString.call(e).slice(8,-1);if(t==="Object"&&e.constructor&&(t=e.constructor.name),t==="Map"||t==="Set")return Array.from(e);if(t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return j(e,n)}function j(e,n){(n==null||n>e.length)&&(n=e.length);for(var t=0,c=new Array(n);t<n;t++)c[t]=e[t];return c}function O(e){return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?O=function(t){return typeof t}:O=function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},O(e)}(function(){var e=Object.create,n=Object.defineProperty,t=Object.getPrototypeOf,c=Object.prototype.hasOwnProperty,b=Object.getOwnPropertyNames,d=Object.getOwnPropertyDescriptor,v=function(r){return n(r,"__esModule",{value:!0})},g=function(r,o){return function(){return o||(o={exports:{}},r(o.exports,o)),o.exports}},f=function(r,o,s){if(v(r),o&&O(o)=="object"||typeof o=="function"){var l=T(b(o)),u;try{var m=function(){var i=u.value;!c.call(r,i)&&i!=="default"&&n(r,i,{get:function(){return o[i]},enumerable:!(s=d(o,i))||s.enumerable})};for(l.s();!(u=l.n()).done;)m()}catch(p){l.e(p)}finally{l.f()}}return r},a=function(r){return r&&r.__esModule?r:f(n(r!=null?e(t(r)):{},"default",{value:r,enumerable:!0}),r)},w=g(function(y){"use strict";Object.defineProperty(y,"__esModule",{value:!0}),y.debounce=r,y.throttle=o;function r(s,l){var u;return function(){var m=this,p=arguments,i=function(){u=null,s.apply(m,p)};clearTimeout(u),u=setTimeout(i,l)}}function o(s,l){var u;return function(){var m=this;if(u)return;var p=arguments,i=function(){u=null,s.apply(m,p)};u=setTimeout(i,l)}}}),h=a(w()),_={};typeof Origami=="undefined"&&(self.Origami={}),self.Origami["@financial-times/o-utils"]=h,_["@financial-times/o-utils"]=h,typeof start_app=="function"&&start_app(_)})();})();\n');
                proclaim.deepStrictEqual(getEcmaVersion(text), 5);

                const script = new vm.Script(text);

                const context = {
                    start_app: sinon.spy(),
                };
                context.self = context;
                script.runInNewContext(context);
                proclaim.isObject(context.Origami);
                proclaim.isObject(context.Origami['@financial-times/o-utils']);
                proclaim.isFunction(context.Origami['@financial-times/o-utils'].debounce);
                proclaim.isFunction(context.Origami['@financial-times/o-utils'].throttle);
                proclaim.isTrue(context.start_app.calledOnce);
                proclaim.deepStrictEqual(context.start_app.firstCall.args, [
                    context.Origami
                ]);
            }).end(done);
        });

        it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'application/javascript; charset=utf-8').end(done);
		});

    });

});
