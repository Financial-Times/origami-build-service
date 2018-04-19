'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');
const CssBundler = testhelper.CssBundler;

const log = testhelper.log;
const ModuleInstallation = testhelper.ModuleInstallation;
const ModuleSet = testhelper.ModuleSet;
const formatErrorMessage = require('../lib/middleware/sanitize-errors').formatErrorMessage;

suiteWithPackages('dependencies has_external_dependency', [], function(installdir){
	this.timeout(20*1000);

	spawnTest('install-with-deps', function*(){
		const moduleset = new ModuleSet(['o-test-component']);
		const brand = 'master';
		const installation = new ModuleInstallation(moduleset, {dir:installdir, log:log});


		yield installation.install();
		const list = yield installation.list();
		assert(!('test-component' in list), 'Expected it not to use name from the package');
		assert('o-test-component' in list, 'Expected it not to use name from the package');
		assert(!('t1dep' in list), 'Dependencies should not be listed explicitly');
		assert(!('test1' in list), 'Dependencies should not be listed explicitly');
		assert(!('test-package1' in list), 'Dependencies should not be listed explicitly');

		const cssStream = yield (new CssBundler({ log: log })).getContent(installation, moduleset, brand, { minify: true });
		const css = yield testhelper.bufferStream(cssStream);
		const cssWithoutComment = css.replace(/\/\*.*Shrinkwrap[\s\S]+?\*\/\s*/,'');
		assert.equal(cssWithoutComment, '.o-test-component-brand:after{content:"master"}', 'Expected minified output from test-package2');
		assert.match(css, /^\/\*\* Shrinkwrap URL:\n \*    \/v2\/bundles\/css\?modules=o-test-component%40\d+\.\d+\.\d+&shrinkwrap=\n \*\/\n.test-compile-error\{color:red\}$/);
	});

	spawnTest('conflict has_external_dependency', function*(){
		// TODO -- make this use test-specific components
		const modules = new ModuleSet(['o-techdocs@6.1.3', 'o-video@2.4.0']);
		const installation = new ModuleInstallation(modules, {dir:installdir, log:log});

		try {
			yield installation.install();
			assert(false, 'Should fail');
		} catch(err) {
			assert(err instanceof Error);
			assert.equal(err.code, 'ECONFLICT');
			assert(err.picks);

			const formatted = formatErrorMessage(err);
			assert.include(formatted, 'o-viewport');
			assert.include(formatted, 'Required at version >=1.3.0 <3 by o-techdocs@6.1.3');
			assert.include(formatted, 'Required at version ^3.0.1 by o-video@2.4.0');
		}
	});

	spawnTest('requesting component directly at two different versions', function*(){
		const modules = new ModuleSet(['o-test-component@1.0.0', 'o-test-component@1.0.1']);
		const installation = new ModuleInstallation(modules, {dir:installdir, log:log});

		try {
			yield installation.install();
			assert(false, 'Should fail');
		} catch(err) {
			assert(err instanceof Error);

			const formatted = formatErrorMessage(err);
			assert.include(formatted, 'o-test-component');
			assert.include(formatted, 'Module o-test-component (o-test-component) has been specified more than once');
			assert.include(formatted, 'o-test-component#1.0.1');
			assert.include(formatted, 'o-test-component#1.0.0');
		}
	});
});
