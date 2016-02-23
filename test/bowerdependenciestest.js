'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');
const CssBundler = testhelper.CssBundler;

const log = testhelper.log;
const ModuleInstallation = testhelper.ModuleInstallation;
const ModuleSet = testhelper.ModuleSet;
const getFormattedError = require('../lib/express/errorresponse').getFormattedError;

suiteWithPackages('dependencies has_external_dependency', ['test1','test2','conflict1','conflict2'], function(installdir){
	this.timeout(20*1000);

	spawnTest('install-with-deps', function*(){
		const moduleset = new ModuleSet(['./test2']);
		const installation = new ModuleInstallation(moduleset, {dir:installdir, log:log, whitelist:'*'});


		yield installation.install();
		const list = yield installation.list();
		assert('test2' in list, 'Expected it not to use name from the package');
		assert(!('t1dep' in list), 'Dependencies should not be listed explicitly');
		assert(!('test1' in list), 'Dependencies should not be listed explicitly');
		assert(!('test-package1' in list), 'Dependencies should not be listed explicitly');

		const cssStream = yield (new CssBundler({log:log})).getContent(installation, moduleset, { minify: true });
		const css = yield testhelper.bufferStream(cssStream);
		const cssWithoutComment = css.replace(/\/\*.*Shrinkwrap[\s\S]+?\*\/\s*/,'');
		assert.equal(cssWithoutComment, '#test2{foo:bar}', 'Expected minified output from test-package2');
	});

	spawnTest('conflict has_external_dependency', function*(){
		const modules = new ModuleSet(['./conflict1','./conflict2']);
		const installation = new ModuleInstallation(modules, {dir:installdir, log:log, whitelist:'*'});

		try {
			yield installation.install();
			assert(false, 'Should fail');
		} catch(err) {
			assert(err instanceof Error);
			assert.equal(err.code, 'ECONFLICT');
			assert(err.picks);

			const formatted = getFormattedError(err);
			assert.include(formatted, 'impossible');
			assert.include(formatted, 'Required at version 2.6.3 by conflict1');
			assert.include(formatted, 'Required at version 2.7.0 by conflict2');
		}
	});
});
