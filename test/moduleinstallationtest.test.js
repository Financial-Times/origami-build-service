'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');
const JsBundler = testhelper.JsBundler;
const CssBundler = testhelper.CssBundler;

const log = testhelper.log;
const pfs = testhelper.pfs;
const Q = testhelper.Q;
const ModuleInstallation = testhelper.ModuleInstallation;
const ModuleSet = testhelper.ModuleSet;

suite('installation-remote', function() {
	this.timeout(10*60*1000);

	spawnTestWithTempdir('install-external has_external_dependency', function*(tmpdir) {
		const moduleset = new ModuleSet(['jquery@2.0.3','lodash']);
		const brand = 'master';
		const installation = new ModuleInstallation(moduleset, { dir: tmpdir, log: log });

		let installed = yield installation.install();
		assert('jquery' in installed, 'Expected jQuery to be installed');
		assert('lodash' in installed);
		assert.equal('2.0.3', installed.jquery.pkgMeta.version);

		installed = yield installation.install();
		assert.deepEqual({}, installed, 'Nothing new should be installed');

		const list = yield installation.list();
		assert('jquery' in list);
		assert('lodash' in list);

		assert.equal(0, list.jquery.paths[0].indexOf(yield pfs.realpath(tmpdir)), 'should be absolute canonical path ' + list.jquery.paths[0]);

		const exists = yield Q.all([pfs.pathExists(list.jquery.paths[0]), pfs.pathExists(list.lodash.paths[0])]);
		assert.deepEqual([true,true], exists, 'Expected installed files to exist');

		const jsStream = yield (new JsBundler({ log: log })).getContent(installation, moduleset, brand, {minify:'none'});

		const jsContent = yield testhelper.bufferStream(jsStream);

		assert(jsContent.indexOf('lodash') >= 0, 'Expected Lo-Dash (doccomment) in the output');
		assert.include(jsContent, 'jQuery', 'Expected jQuery in the output');

		const destroyed = yield installation.destroy();
		assert(!destroyed, 'After destroy() the directory should not longer exist');
	});

	spawnTestWithTempdir('export has_external_dependency', function*(tmpdir) {
		const moduleset = new ModuleSet(['https://github.com/Financial-Times/o-assets.git']);
		const brand = 'master';
		const installation = new ModuleInstallation(moduleset, { dir: tmpdir, log: log });

		yield installation.install();
		const jsStream = yield (new JsBundler({ log: log })).getContent(installation, moduleset, brand, {exportName:'myExportVariable'});
		const jsContent = yield testhelper.bufferStream(jsStream);

		assert.include(jsContent, 'myExportVariable');
	});

	spawnTestWithTempdir('install-implied-main has_external_dependency', function*(tmpdir){
		const moduleset = new ModuleSet(['Financial-Times/o-forms']);
		const brand = 'master';
		const installation = new ModuleInstallation(moduleset, { dir: tmpdir, log: log });

		const installed = yield installation.install();
		assert('o-forms' in installed);

		const list = yield installation.list();
		assert('o-forms' in list);
		assert.include(list['o-forms'].paths[0], 'bower_components/o-forms/main.scss');

		const path = installation.getPathToComponentsFile('o-forms', '../../main.scss');
		assert.include(path, 'bower_components/o-forms/main.scss');
		assert.notInclude(path, '..');

		const cssStream = yield (new CssBundler({ log: log })).getContent(installation, moduleset, brand);
		const css = yield testhelper.bufferStream(cssStream);
		assert.include(css, '.o-forms__label');
	});

	spawnTestWithTempdir('css-no-minify has_external_dependency', function*(tmpdir) {
		const moduleset = new ModuleSet(['o-gallery']);
		const brand = 'master';
		const installation = new ModuleInstallation(moduleset, { dir: tmpdir, log: log });

		yield installation.install();
		const bundler = new CssBundler({log:log});
		const cssStream = yield bundler.getContent(installation, moduleset, brand, {minify:'none'});
		const css = yield testhelper.bufferStream(cssStream);
		assert.include(css, '/*', 'expected comments in unminified CSS');
	});

	spawnTestWithTempdir('version-of-subresource has_external_dependency', function*(tmpdir) {
		const moduleset = new ModuleSet(['o-gallery']);
		const brand = 'master';
		const installation = new ModuleInstallation(moduleset, { dir: tmpdir, log: log });
		yield installation.install();
		const cssStream = yield (new CssBundler({ log: log })).getContent(installation, moduleset, brand, {minify:'none'});

		const css = yield testhelper.bufferStream(cssStream);

		assert.notInclude(css, 'o-icons/build/ft-icons');
		assert.include(css, 'o-icons%40', 'Subresource needs to be versioned');
	});

	spawnTestWithTempdir('install-external nonexistant-module', function*(tmpdir) {
		// don't create this module, please
		const moduleset = new ModuleSet(['o-module-that-does-not-exist']);
		const installation = new ModuleInstallation(moduleset, { dir: tmpdir, log: log });
		try {
			yield installation.install();
			assert(false); // we shouldn't get to this point
		} catch (err) {
			assert.strictEqual(err.code, 'ENOTFOUND');
		}
	});

	spawnTestWithTempdir('install-external nonexistant-git-repo', function*(tmpdir) {
		// don't create this module, please
		const moduleset = new ModuleSet(['https://github.com/Financial-Times/o-module-that-does-not-exist.git']);
		const installation = new ModuleInstallation(moduleset, { dir: tmpdir, log: log });
		try {
			yield installation.install();
			assert(false); // we shouldn't get to this point
		} catch (err) {
			assert.strictEqual(err.code, 'ENOTFOUND');
		}
	});
});
