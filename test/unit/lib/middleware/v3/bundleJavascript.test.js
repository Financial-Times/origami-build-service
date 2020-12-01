/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const fs = require('fs').promises;
const path = require('path');
const getEcmaVersion = require('detect-es-version').getEcmaVersion;
const vm = require('vm');
const util = require('util');
const rimraf = require('rimraf');
const rmrf = util.promisify(rimraf);

describe('bundleJavascript', () => {
	let bundleJavascript;

	beforeEach(function () {
		bundleJavascript = require('../../../../../lib/middleware/v3/bundleJavascript')
			.bundleJavascript;
	});

	it('it is a function', async () => {
		proclaim.isFunction(bundleJavascript);
	});

	context('given valid javascript', () => {
		let location;
		beforeEach(async () => {
			await fs.mkdir('/tmp/bundle/', {recursive: true});

			location = await fs.mkdtemp('/tmp/bundle/');
			await fs.writeFile(
				path.join(location, 'index.js'),
				'import {add} from "./add.js"; globalThis.magicNumber = add(1,2,3,4,5,6,7,8,9);',
				'utf-8'
			);
			await fs.writeFile(
				path.join(location, 'add.js'),
				'export function add (...numbers) { let result = 0; for (const number of numbers) {result += number;} return result;};',
				'utf-8'
			);
		});

		afterEach(async () => {
			await rmrf(location);
		});
		it('it bundles the index.js file in the provided folder location and returns it as a string', async () => {
			const bundledJavaScript = await bundleJavascript(location);
			proclaim.deepStrictEqual(
				bundledJavaScript,
				'(function(){"use strict";(function(){function o(){for(var n=0,t=arguments.length,u=new Array(t),r=0;r<t;r++)u[r]=arguments[r];for(var a=0,g=u;a<g.length;a++){var s=g[a];n+=s}return n}globalThis.magicNumber=o(1,2,3,4,5,6,7,8,9)})();})();\n'
			);
			proclaim.deepStrictEqual(getEcmaVersion(bundledJavaScript), 5);

			const script = new vm.Script(bundledJavaScript);

			const context = {};
			script.runInNewContext(context);
			proclaim.deepStrictEqual(context, {
				magicNumber: 45,
			});
		});
	});

	context('given invalid javascript', () => {
		let location;
		beforeEach(async () => {
			await fs.mkdir('/tmp/bundle/', {recursive: true});

			location = await fs.mkdtemp('/tmp/bundle/');
			await fs.writeFile(
				path.join(location, 'index.js'),
				'import {add} from "abra"; globalThis.magicNumber = add(1,2,3,4,5,6,7,8,9);',
				'utf-8'
			);
		});

		afterEach(async () => {
			await rmrf(location);
		});
		it('it throws an error', async () => {
            try {
                await bundleJavascript(location);
                proclaim.notOk('Expected function to throw but it did not.');
            } catch (err) {
                proclaim.isInstanceOf(err, Error);
            }
        });
	});
});
