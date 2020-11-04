'use strict';

const assert = require('chai').assert;
const request = require('supertest');
const jsdom = require('jsdom');
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

describe.only('GET /v3/bundles/js', function() {
    this.timeout(20000);
    this.slow(5000);

    describe('when a valid module is requested', function() {
        const moduleName = '@financial-times/o-utils@1.1.7';

        beforeEach(function() {
            this.request = request(this.app)
                .get(`/v3/bundles/js?modules=${moduleName}`)
                .set('Connection', 'close');
        });

        it('should respond with a 200 status', function(done) {
            this.request.expect(200).end(done);
        });

        it('should respond with the bundled JavaScript', function(done) {
            this.request
                .expect(({ text }) => {
                    assert.doesNotThrow(() => executeScript(text));
                })
                .end(done);
        });

        it('should export the bundle under `Origami` global variable', function(done) {
            this.request
                .expect(({text}) => {
                    let resultWindow;
                    assert.doesNotThrow(() => {
                        resultWindow = executeScript(text);
                    });
                    assert.property(resultWindow, 'Origami');
                    assert.property(resultWindow.Origami, '@financial-times/o-utils');
                })
                .end(done);
        });

    });

    describe('when an invalid module is requested (nonexistent)', function() {
        const moduleName = 'hello-nonexistent-module@1';

        beforeEach(function() {
            this.request = request(this.app)
                .get(`/v3/bundles/js?modules=${moduleName}`)
                .set('Connection', 'close');
        });

        it('should respond with a 400 status', function(done) {
            this.request.expect(400).end(done);
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

    // });

    describe('when the modules parameter is missing', function() {

        beforeEach(function() {
            this.request = request(this.app)
                .get('/v3/bundles/js')
                .set('Connection', 'close');
        });

        it('should respond with a 400 status', function(done) {
            this.request.expect(400).end(done);
        });

        it('should respond with an error message', function(done) {
            this.request.expect('throw new Error("Origami Build Service returned an error: The modules query parameter can not be empty.")').end(done);
        });

    });

    describe('when the modules parameter is not a string', function() {

        beforeEach(function() {
            this.request = request(this.app)
                .get('/v3/bundles/js?modules[]=foo&modules[]=bar')
                .set('Connection', 'close');
        });

        it('should respond with a 400 status', function(done) {
            this.request.expect(400).end(done);
        });

        it('should respond with an error message', function(done) {
            this.request.expect('throw new Error("Origami Build Service returned an error: The modules query parameter must be a string.")').end(done);
        });

    });

    describe('when a module name cannot be parsed', function() {
        const moduleName = 'http://1.2.3.4/';

        beforeEach(function() {
            this.request = request(this.app)
                .get(`/v3/bundles/js?modules=${moduleName}`)
                .set('Connection', 'close');
        });

        it('should respond with a 400 status', function(done) {
            this.request.expect(400).end(done);
        });

        it('should respond with an error message', function(done) {
            this.request.expect('throw new Error("Origami Build Service returned an error: The modules query parameter contains module names which are not valid: http://1.2.3.4/.")').end(done);
        });

    });

});
