'use strict';

const assert = require('chai').assert;
const request = require('supertest');
const jsdom = require('jsdom');
const sinon = require('sinon');
const cheerio = require('cheerio');

const getErrorMessage = (text) => {
	const $ = cheerio.load(text);
	return $('[data-test-id="error-message"]').text();
};

const CORE_JS_GLOBAL_PROPERTY = '__core-js_shared__';

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
            this.request
                .expect(/^\/\*\* Shrinkwrap URL:\n \*/)
                .expect(({ text }) => {
                    assert.doesNotThrow(() => executeScript(text));
                })
                .end(done);
        });

        it('should minify the bundle', function(done) {
            this.request.end((error, response) => {
                assert.notInclude(response.text, '// unminified');
                done(error);
            });
        });

        it('should export the bundle under `window.Origami`', function(done) {
            this.request
                .expect(({text}) => {
                    let resultWindow = {};
                    assert.doesNotThrow(() => {
                        resultWindow = executeScript(text);
                    });
                    assert.property(resultWindow, 'Origami');
                    assert.property(resultWindow.Origami, moduleName.split('@')[0]);
                })
                .end(done);
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
            this.request
                .expect(({ text }) => {
                    let resultWindow = {};
                    assert.doesNotThrow(() => {
                        resultWindow = executeScript(text);
                    });
                    assert.property(resultWindow, 'Origami');
                    assert.notProperty(resultWindow.Origami, 'o-autoinit');
                })
                .end(done);
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
            this.request
                .expect(({ text }) => {
                    let resultWindow = {};
                    assert.doesNotThrow(() => {
                        resultWindow = executeScript(text);
                    });
                    assert.property(resultWindow, 'foo');
                    assert.property(resultWindow.foo, moduleName.split('@')[0]);
                })
                .end(done);
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
            const givenWindow = createWindow();
            Object.defineProperty(givenWindow, 'Origami', { set() {
                throw new Error('Attempted to set Origami property on window');
            } });
            this.request
                .expect(({ text }) => {
                    assert.doesNotThrow(() => executeScript(text, givenWindow));
                    assert.notProperty(givenWindow, 'Origimi');
                })
                .end(done);
        });

    });

    describe('when a valid module is requested (with the `callback` parameter set to a non-empty string)', function() {
        const moduleName = 'o-test-component@1.0.2';
        const givenCallback = 'page.load.deep';

        const makeRequest = function(callback) {
            const now = new Date().toISOString();
            return request(this.app)
                .get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}&callback=${callback}`)
                .set('Connection', 'close');
        };

        it('should respond with a 200 status', function(done) {
            makeRequest.call(this, givenCallback)
                .expect(200)
                .end(done);
        });

        it('should include the given callback parameter, executed with the bundle context', function(done) {
            const givenWindow = createWindow();
            givenWindow.page = {
                load: {
                    deep: sinon.stub()
                }
            };
            makeRequest.call(this, givenCallback)
                .expect(({text}) => {
                    assert.doesNotThrow(() => executeScript(text, givenWindow));
                    assert.property(givenWindow.page.load.deep.getCall(0).args[0], moduleName.split('@')[0]);
                })
                .end(done);
        });

        [';my.Function', 'my.function;other'].forEach((callback) => {
            it(`should call the callback if it is '${callback}' and does not match the pattern ^[\\w\\.]+$`, function(done) {
                const givenWindow = createWindow();
                givenWindow.page = {
                    load: {
                        deep: sinon.stub()
                    }
                };
                makeRequest.call(this, callback)
                    .expect(({text}) => {
                        assert.doesNotThrow(() => executeScript(text, givenWindow));
                        assert.isTrue(givenWindow.page.load.deep.notCalled, 'Callback was called unexpectedly');
                    })
                    .end(done);
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
            this.request
                .expect(({ text }) => {
                    let resultWindow;
                    assert.doesNotThrow(() => {
                        resultWindow = executeScript(text);
                    });
                    assert.notProperty(resultWindow, CORE_JS_GLOBAL_PROPERTY);
                })
                .end(done);
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
            this.request
                .expect(({ text }) => {
                    let resultWindow;
                    assert.doesNotThrow(() => {
                        resultWindow = executeScript(text);
                    });
                    assert.property(resultWindow, CORE_JS_GLOBAL_PROPERTY);
                })
                .end(done);
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

describe('export parameter as xss attack vector', function() {
    const moduleName = 'o-test-component@1.0.16';

    beforeEach(function() {
        this.request = request(this.app)
            .get(`/v2/bundles/js?modules=${moduleName}&export='];alert('oops')//`)
            .set('Connection', 'close');
    });

    it('should respond with a 400 status', function(done) {
        this.request.expect(400).end(done);
    });

    it('should respond with an error message ', function(done) {
        this.request.expect(/The export parameter can only contain underscore, period, and alphanumeric characters. The export parameter given was: &#x27;];alert\(&#x27;oops&#x27;\)\/\//).end(done);
    });

    it('should respond with HTML', function(done) {
		this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
	});
});

describe('when an origami specification v2 component is requested', function() {
    const moduleName = 'o-test-component@2.0.0-beta.1';

    beforeEach(function() {
        this.request = request(this.app)
            .get(`/v2/bundles/js?modules=${moduleName}`)
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
