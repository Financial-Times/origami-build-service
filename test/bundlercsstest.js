'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');
const CssBundler = testhelper.CssBundler;
const hostnames = require('../lib/utils/hostnames');

const log = testhelper.log;
const ModuleInstallation = testhelper.ModuleInstallation;
const ModuleSet = testhelper.ModuleSet;

suiteWithPackages('installation-css has_external_dependency', ['invalidcss', 'test1'], function(installdir){
	this.timeout(15*1000);

	spawnTest('ok-sass', function*(){
		const moduleset = new ModuleSet(['./test1']);
		const installation = new ModuleInstallation(moduleset, {dir:installdir, log:log, whitelist:'*'});

		yield installation.install();
		const css = yield testhelper.bufferStream(yield (new CssBundler({log:log})).getContent(installation, moduleset,{minify:true}));

		const cssWithoutShrink = css.replace(/\/\*.*Shrinkwrap[\s\S]+?\*\/\s*/,'');
		assert.equal(cssWithoutShrink, '#test1{hello:world;silent-var:false;url:url(https://' + hostnames.preferred + '/v2/files/test-package1@*/README)}');
	});

	spawnTest('invalid-sass', function*(){
		const moduleset = new ModuleSet(['./invalidcss']);
		const installation = new ModuleInstallation(moduleset, {dir:installdir, log:log, whitelist:'*'});

		yield installation.install();
		try {
			yield testhelper.bufferStream(yield (new CssBundler({log:log})).getContent(installation, moduleset));
			assert(false, 'Should have failed');
		} catch(err) {
			assert(err instanceof Error, 'Sass should fail');
			assert.include(err.message, 'errorhere', 'Error from Sass should be included: ' + err.stack);
			assert.notInclude(err.message, 'installdir', 'Should hide full path');
			assert.notInclude(err.message, '@error;', 'Sass should fail before CSSO');
		}
	});

	spawnTest('invalid-css', function*(){
		const moduleset = new ModuleSet(['./invalidcss:/borked.css']);
		const installation = new ModuleInstallation(moduleset, {dir:installdir, log:log, whitelist:'*'});

		yield installation.install();

		const css = yield testhelper.bufferStream(yield (new CssBundler({log:log})).getContent(installation, moduleset));
		assert.include(css, '@error;', 'Expecting invalid CSS passed through without CSSO');
		assert.include(css, '/*', 'Expecting error injected into the output');
		assert.include(css, 'error:', 'Expecting error injected into the output');

	}, /* skip */ true);
});
