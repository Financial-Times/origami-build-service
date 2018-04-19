'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');
const CssBundler = testhelper.CssBundler;

const log = testhelper.log;
const ModuleInstallation = testhelper.ModuleInstallation;
const ModuleSet = testhelper.ModuleSet;

suiteWithPackages('installation-css has_external_dependency', ['invalidcss', 'test1'], function(installdir){
	this.timeout(15*1000);

	spawnTest('ok-sass', function*(){
		const brand = 'master';
		const moduleset = new ModuleSet(['o-test-component@1.0.5']);
		const installation = new ModuleInstallation(moduleset, {dir:installdir, log:log});

		yield installation.install();
		const css = yield testhelper.bufferStream(yield (new CssBundler({log:log})).getContent(installation, moduleset, brand,{minify:true}));

		const cssWithoutShrink = css.replace(/\/\*.*Shrinkwrap[\s\S]+?\*\/\s*/,'');
		// assert.equal(cssWithoutShrink, '#test1{hello:world;silent-var:false;url:url(https://' + hostnames.preferred + '/v2/files/test-package1@*/README)}');
		assert.equal(cssWithoutShrink, '#test-compile-error{color:red}');
	});

	spawnTest('invalid-sass', function*(){
		const moduleset = new ModuleSet(['o-test-component@1.0.3']);
		const installation = new ModuleInstallation(moduleset, {dir:installdir, log:log});

		yield installation.install();
		try {
			yield testhelper.bufferStream(yield (new CssBundler({log:log})).getContent(installation, moduleset));
			assert(false, 'Should have failed');
		} catch(err) {
			assert(err instanceof Error, 'Sass should fail');
			assert.include(err.message, 'Error:', 'Error from Sass should be included: ' + err.stack);
			assert.notInclude(err.message, installdir, 'Should hide full path');
			assert.notInclude(err.message, '@error;', 'Sass should fail before CSSO');
		}
	});

	spawnTest('invalid-css', function*(){
		const moduleset = new ModuleSet(['o-test-component@1.0.7:/syntaxerr.css']);
		const installation = new ModuleInstallation(moduleset, {dir:installdir, log:log});

		yield installation.install();

		const css = yield testhelper.bufferStream(yield (new CssBundler({log:log})).getContent(installation, moduleset));
		assert.include(css, '@error;', 'Expecting invalid CSS passed through without CSSO');
		assert.include(css, '/*', 'Expecting error injected into the output');
		assert.include(css, 'error:', 'Expecting error injected into the output');

	}, /* skip */ true);
});
