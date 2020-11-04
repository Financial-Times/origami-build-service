/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const getEcmaVersion = require('detect-es-version').getEcmaVersion;
const vm = require('vm');
const httpMock = require('node-mocks-http');

describe('createJavaScriptBundle', function () {
	this.timeout(10 * 1000);
	let createJavaScriptBundle;

	beforeEach(function () {
		createJavaScriptBundle = require('../../../../../lib/middleware/v3/createJavaScriptBundle')
			.createJavaScriptBundle;
	});

	it('it is a function', async () => {
		proclaim.isFunction(createJavaScriptBundle);
	});

	context('when given a valid request', function () {
		it('it responds with a javascript bundle which contains the requested module', async () => {
			const request = httpMock.createRequest();
			const response = httpMock.createResponse();
			request.query.modules = '@financial-times/o-utils@1.1.7';

			await createJavaScriptBundle(request, response);

			const bundle = response._getData();

			proclaim.deepStrictEqual(
				response.getHeader('content-type'),
				'application/javascript;charset=UTF-8'
			);
			proclaim.deepStrictEqual(
				response.getHeader('cache-control'),
				'public, max-age=86400, stale-if-error=604800, stale-while-revalidate=300000'
            );
            proclaim.deepStrictEqual(response.statusCode, 200);

			proclaim.deepStrictEqual(
				bundle,
				'(function(){"use strict";function A(e,n){var t;if(typeof Symbol=="undefined"||e[Symbol.iterator]==null){if(Array.isArray(e)||(t=w(e))||n&&e&&typeof e.length=="number"){t&&(e=t);var c=0,b=function(){};return{s:b,n:function(){return c>=e.length?{done:!0}:{done:!1,value:e[c++]}},e:function(a){throw a},f:b}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var v=!0,d=!1,h;return{s:function(){t=e[Symbol.iterator]()},n:function(){var a=t.next();return v=a.done,a},e:function(a){d=!0,h=a},f:function(){try{!v&&t.return!=null&&t.return()}finally{if(d)throw h}}}}function w(e,n){if(!e)return;if(typeof e=="string")return S(e,n);var t=Object.prototype.toString.call(e).slice(8,-1);if(t==="Object"&&e.constructor&&(t=e.constructor.name),t==="Map"||t==="Set")return Array.from(e);if(t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return S(e,n)}function S(e,n){(n==null||n>e.length)&&(n=e.length);for(var t=0,c=new Array(n);t<n;t++)c[t]=e[t];return c}function g(e){return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?g=function(t){return typeof t}:g=function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},g(e)}(function(){var e=Object.create,n=Object.defineProperty,t=Object.getPrototypeOf,c=Object.prototype.hasOwnProperty,b=Object.getOwnPropertyNames,v=Object.getOwnPropertyDescriptor,d=function(r){return n(r,"__esModule",{value:!0})},h=function(r,o){return function(){return o||(o={exports:{}},r(o.exports,o)),o.exports}},f=function(r,o,s){if(d(r),g(o)=="object"||typeof o=="function"){var l=A(b(o)),u;try{var m=function(){var i=u.value;!c.call(r,i)&&i!=="default"&&n(r,i,{get:function(){return o[i]},enumerable:!(s=v(o,i))||s.enumerable})};for(l.s();!(u=l.n()).done;)m()}catch(p){l.e(p)}finally{l.f()}}return r},a=function(r){return r&&r.__esModule?r:f(n(e(t(r)),"default",{value:r,enumerable:!0}),r)},_=h(function(y){"use strict";Object.defineProperty(y,"__esModule",{value:!0}),y.debounce=r,y.throttle=o;function r(s,l){var u;return function(){var m=this,p=arguments,i=function(){u=null,s.apply(m,p)};clearTimeout(u),u=setTimeout(i,l)}}function o(s,l){var u;return function(){var m=this;if(u)return;var p=arguments,i=function(){u=null,s.apply(m,p)};u=setTimeout(i,l)}}}),j=a(_());typeof Origami=="undefined"&&(self.Origami={}),self.Origami["@financial-times/o-utils"]=j})();})();\n'
			);
			proclaim.deepStrictEqual(getEcmaVersion(bundle), 5);

			const script = new vm.Script(bundle);

			const context = {};
			context.self = context;
			script.runInNewContext(context);
			proclaim.isObject(context.Origami);
			proclaim.isObject(context.Origami['@financial-times/o-utils']);
			proclaim.isFunction(context.Origami['@financial-times/o-utils'].debounce);
			proclaim.isFunction(context.Origami['@financial-times/o-utils'].throttle);
		});
	});

	context('when given a request with no modules parameter', function () {
		it('it responds with a javascript bundle which throws an error', async () => {
			const request = httpMock.createRequest();
			const response = httpMock.createResponse();

			await createJavaScriptBundle(request, response);

			const bundle = response._getData();

			proclaim.deepStrictEqual(
				response.getHeader('content-type'),
				'application/javascript;charset=UTF-8'
			);
			proclaim.deepStrictEqual(
				response.getHeader('cache-control'),
				'max-age=0, must-revalidate, no-cache, no-store'
            );
            proclaim.deepStrictEqual(response.statusCode, 400);

			proclaim.deepStrictEqual(
				bundle,
				'throw new Error("Origami Build Service returned an error: The modules query parameter can not be empty.")'
			);
			proclaim.deepStrictEqual(getEcmaVersion(bundle), 5);

			const script = new vm.Script(bundle);

			const context = {};
			context.self = context;
			proclaim.throws(function () {
				script.runInNewContext(context);
			}, 'Origami Build Service returned an error: The modules query parameter can not be empty.');
		});
	});

	context(
		'when given a request with modules parameter as empty string',
		async () => {
			it('it responds with a javascript bundle which throws an error', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				request.query.modules = '';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'application/javascript;charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'throw new Error("Origami Build Service returned an error: The modules query parameter can not be empty.")'
				);
				proclaim.deepStrictEqual(getEcmaVersion(bundle), 5);

				const script = new vm.Script(bundle);

				const context = {};
				context.self = context;
				proclaim.throws(function () {
					script.runInNewContext(context);
				}, 'Origami Build Service returned an error: The modules query parameter can not be empty.');
			});
		}
	);

	context(
		'when given a request with a modules parameter which contains duplicates',
		async () => {
			it('it responds with a javascript bundle which throws an error', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				request.query.modules = 'o-test@1,o-test@1';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'application/javascript;charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'throw new Error("Origami Build Service returned an error: The modules query parameter contains duplicate module names.")'
				);
				proclaim.deepStrictEqual(getEcmaVersion(bundle), 5);

				const script = new vm.Script(bundle);

				const context = {};
				context.self = context;
				proclaim.throws(function () {
					script.runInNewContext(context);
				}, 'Origami Build Service returned an error: The modules query parameter contains duplicate module names.');
			});
		}
	);
	context(
		'when given a request with a modules parameter which contains empty module names',
		async () => {
			it('it responds with a javascript bundle which throws an error', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				request.query.modules = 'o-test@1,,';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'application/javascript;charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'throw new Error("Origami Build Service returned an error: The modules query parameter can not contain empty module names.")'
				);
				proclaim.deepStrictEqual(getEcmaVersion(bundle), 5);

				const script = new vm.Script(bundle);

				const context = {};
				context.self = context;
				proclaim.throws(function () {
					script.runInNewContext(context);
				}, 'Origami Build Service returned an error: The modules query parameter can not contain empty module names.');
			});
		}
	);
	context(
		'when given a request with a modules parameter which contains a module name with whitespace at the start',
		async () => {
			it('it responds with a javascript bundle which throws an error', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				request.query.modules = ' o-test@1';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'application/javascript;charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'throw new Error("Origami Build Service returned an error: The modules query parameter contains module names which have whitespace at either the start of end of their name. Remove the whitespace from \\" o-test@1\\" to make the module name valid.")'
				);
				proclaim.deepStrictEqual(getEcmaVersion(bundle), 5);

				const script = new vm.Script(bundle);

				const context = {};
				context.self = context;
				proclaim.throws(function () {
					script.runInNewContext(context);
				}, 'Origami Build Service returned an error: The modules query parameter contains module names which have whitespace at either the start of end of their name. Remove the whitespace from \" o-test@1\" to make the module name valid.');
			});
		}
	);
	context(
		'when given a request with a modules parameter which contains a module name with whitespace at the end',
		async () => {
			it('it responds with a javascript bundle which throws an error', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				request.query.modules = 'o-test@1 ';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'application/javascript;charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'throw new Error("Origami Build Service returned an error: The modules query parameter contains module names which have whitespace at either the start of end of their name. Remove the whitespace from \\"o-test@1 \\" to make the module name valid.")'
				);
				proclaim.deepStrictEqual(getEcmaVersion(bundle), 5);

				const script = new vm.Script(bundle);

				const context = {};
				context.self = context;
				proclaim.throws(function () {
					script.runInNewContext(context);
				}, 'Origami Build Service returned an error: The modules query parameter contains module names which have whitespace at either the start of end of their name. Remove the whitespace from \"o-test@1 \" to make the module name valid.');
			});
		}
	);
	context(
		'when given a request with a modules parameter which contains a module name without a version',
		async () => {
			it('it responds with a javascript bundle which throws an error', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				request.query.modules = 'o-test';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'application/javascript;charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'throw new Error("Origami Build Service returned an error: The bundle request contains o-test with no version range, a version range is required.\\nPlease refer to TODO (build service documentation) for what is a valid version.")'
				);
				proclaim.deepStrictEqual(getEcmaVersion(bundle), 5);

				const script = new vm.Script(bundle);

				const context = {};
				context.self = context;
				proclaim.throws(function () {
					script.runInNewContext(context);
				}, 'Origami Build Service returned an error: The bundle request contains o-test with no version range, a version range is required.\nPlease refer to TODO (build service documentation) for what is a valid version.');
			});
		}
	);
	context(
		'when given a request with a modules parameter which contains a module name with an invalid version',
		async () => {
			it('it responds with a javascript bundle which throws an error', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				request.query.modules = 'o-test@5wg';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'application/javascript;charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'throw new Error("Origami Build Service returned an error: The version 5wg in o-test@5wg@5wg is not a valid version.\\nPlease refer to TODO (build service documentation) for what is a valid version.")'
				);
				proclaim.deepStrictEqual(getEcmaVersion(bundle), 5);

				const script = new vm.Script(bundle);

				const context = {};
				context.self = context;
				proclaim.throws(function () {
					script.runInNewContext(context);
				}, 'Origami Build Service returned an error: The version 5wg in o-test@5wg@5wg is not a valid version.\nPlease refer to TODO (build service documentation) for what is a valid version.');
			});
		}
	);
	context(
		'when given a request with a modules parameter which contains a invalid module names',
		async () => {
			it('it responds with a javascript bundle which throws an error', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				request.query.modules = 'o-TeSt@5';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'application/javascript;charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
                );
                proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'throw new Error("Origami Build Service returned an error: The modules query parameter contains module names which are not valid: o-TeSt.")'
				);
				proclaim.deepStrictEqual(getEcmaVersion(bundle), 5);

				const script = new vm.Script(bundle);

				const context = {};
				context.self = context;
				proclaim.throws(function () {
					script.runInNewContext(context);
				}, 'Origami Build Service returned an error: The modules query parameter contains module names which are not valid: o-TeSt.');
			});
		}
	);
});
