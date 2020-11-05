'use strict';

const assert = require('chai').assert;
const request = require('supertest');

describe('GET /v3/bundles/js', function() {
    this.timeout(20000);
    this.slow(5000);

    describe('when a valid module is requested', function() {
        const moduleName = '@financial-times/o-normalise@100.0.0-11';

        beforeEach(function() {
            this.request = request(this.app)
                .get(`/v3/bundles/css?modules=${moduleName}`)
                .set('Connection', 'close');
        });

        it('should respond with a 200 status', function(done) {
            this.request.expect(200).end(done);
        });

        it('should respond with the css', function(done) {
            this.request.expect('html,body{margin:0;text-rendering:optimizeLegibility;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}@media(prefers-reduced-motion: reduce){html *,html *:before,html *:after,body *,body *:before,body *:after{animation-duration:.001s !important;transition-duration:.001s !important;animation-iteration-count:1 !important}}main{display:block}body:not(.js-focus-visible) :focus,html:not(.js-focus-visible) :focus{outline:2px solid #1470cc}body:not(.js-focus-visible) input:focus,body:not(.js-focus-visible) textarea:focus,body:not(.js-focus-visible) select:focus,html:not(.js-focus-visible) input:focus,html:not(.js-focus-visible) textarea:focus,html:not(.js-focus-visible) select:focus{box-shadow:0 0 0 1px #1470cc}body.js-focus-visible .focus-visible,html.js-focus-visible .focus-visible{outline:2px solid #1470cc}body.js-focus-visible input.focus-visible,body.js-focus-visible textarea.focus-visible,body.js-focus-visible select.focus-visible,html.js-focus-visible input.focus-visible,html.js-focus-visible textarea.focus-visible,html.js-focus-visible select.focus-visible{box-shadow:0 0 0 1px #1470cc}body.js-focus-visible :focus:not(.focus-visible),html.js-focus-visible :focus:not(.focus-visible){outline:0}:focus-visible,body:not(.js-focus-visible) :focus,html:not(.js-focus-visible) :focus{outline:unset}:focus-visible,body:not(.js-focus-visible) input:focus,html:not(.js-focus-visible) input:focus,body:not(.js-focus-visible) textarea:focus,html:not(.js-focus-visible) textarea:focus,body:not(.js-focus-visible) select:focus,html:not(.js-focus-visible) select:focus{box-shadow:unset}:focus-visible{outline:2px solid #1470cc}input:focus-visible,textarea:focus-visible,select:focus-visible{box-shadow:0 0 0 1px #1470cc}html:focus,body:focus,[readonly]:focus{outline:none}a{background-color:transparent}a:active,a:hover{outline-width:0}abbr[title]{border-bottom:0;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:inherit}b,strong{font-weight:bolder}dfn{font-style:italic}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-0.25em}sup{top:-0.5em}img{border-style:none}optgroup{font-weight:bold}button,input,select{overflow:visible}button,input,select,textarea{margin:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{cursor:pointer}[disabled]{cursor:default}button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}textarea{overflow:auto}.o-normalise-clearfix{zoom:1}.o-normalise-clearfix:before,.o-normalise-clearfix:after{content:"";display:table;display:flex}.o-normalise-clearfix:after{clear:both}.o-normalise-visually-hidden{position:absolute;clip:rect(0 0 0 0);clip-path:polygon(0 0, 0 0);margin:-1px;border:0;overflow:hidden;padding:0;width:1px;height:1px;white-space:nowrap}\n').end(done);
        });

        it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/css; charset=utf-8').end(done);
		});
    });

    describe('when an invalid module is requested (nonexistent)', function() {
        const moduleName = 'hello-nonexistent-module@1';

        beforeEach(function() {
            this.request = request(this.app)
                .get(`/v3/bundles/css?modules=${moduleName}`)
                .set('Connection', 'close');
        });

        it('should respond with a 400 status', function(done) {
            this.request.expect(400).end(done);
        });

        it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/css; charset=utf-8').end(done);
		});

    });

    // describe('when an invalid module is requested (Sass compilation error)', function() {
    //     const moduleName = 'o-test-component@1.0.1';

    //     beforeEach(function() {
    //         this.request = request(this.app)
    //             .get(`/v3/bundles/css?modules=${moduleName}`)
    //             .set('Connection', 'close');
    //     });

    //     it('should respond with a 560 status', function(done) {
    //         this.request.expect(560).end(done);
    //     });

    //     it('should respond with an error message', function(done) {
    //         this.request.expect(/cannot complete build due to compilation error from build tools:/i).end(done);
    //     });

        // it('should respond with the expected `Content-Type` header', function(done) {
        //     this.request.expect('Content-Type', 'text/css; charset=utf-8').end(done);
        // });

    // });

    describe('when the modules parameter is missing', function() {

        beforeEach(function() {
            this.request = request(this.app)
                .get('/v3/bundles/css')
                .set('Connection', 'close');
        });

        it('should respond with a 400 status', function(done) {
            this.request.expect(400).end(done);
        });

        it('should respond with an error message', function(done) {
            this.request.expect('/*"Origami Build Service returned an error: The modules query parameter can not be empty."*/').end(done);
        });

        it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/css; charset=utf-8').end(done);
		});

    });

    describe('when the modules parameter is not a string', function() {

        beforeEach(function() {
            this.request = request(this.app)
                .get('/v3/bundles/css?modules[]=foo&modules[]=bar')
                .set('Connection', 'close');
        });

        it('should respond with a 400 status', function(done) {
            this.request.expect(400).end(done);
        });

        it('should respond with an error message', function(done) {
            this.request.expect('/*"Origami Build Service returned an error: The modules query parameter must be a string."*/').end(done);
        });

        it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/css; charset=utf-8').end(done);
		});

    });

    describe('when a module name cannot be parsed', function() {
        const moduleName = 'http://1.2.3.4/';

        beforeEach(function() {
            this.request = request(this.app)
                .get(`/v3/bundles/css?modules=${moduleName}`)
                .set('Connection', 'close');
        });

        it('should respond with a 400 status', function(done) {
            this.request.expect(400).end(done);
        });

        it('should respond with an error message', function(done) {
            this.request.expect('/*"Origami Build Service returned an error: The modules query parameter contains module names which are not valid: http://1.2.3.4/."*/').end(done);
        });

        it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/css; charset=utf-8').end(done);
		});

    });

});
