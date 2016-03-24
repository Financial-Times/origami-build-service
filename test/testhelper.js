'use strict';

const libdir = process.env.COVER ? '../lib-cov' : '../lib';

const uuid = require('uuid');
const rmrf = require('rimraf');

const log = require(libdir+'/utils/log');

const pfs = require('q-io/fs');
const fs = require('fs');
const path = require('path');
const Q = require(libdir+'/utils/q');
const Output = require(libdir+'/output');
const ModuleSet = require(libdir+'/moduleset');
const PromiseCache = require(libdir+'/utils/promisecache');
const ModuleInstallation = require(libdir+'/moduleinstallation');
const InstallationManager = require(libdir+'/installationmanager');
const Bundler = require(libdir+'/bundler');
const JsBundler = require(libdir+'/jsbundler');
const CssBundler = require(libdir+'/cssbundler');
const DemoCompiler = require(libdir+'/democompiler');
const BuildSystem = require(libdir+'/buildsystem');
const HealthMonitor = require(libdir+'/monitoring/healthmonitor');
const Registry = require(libdir+'/registry.js');
const ModuleMetadata = require(libdir+'/modulemetadata');
const FileProxy = require(libdir+'/fileproxy');

const createApp = require(libdir + '/index');

Q.longStackSupport = true;

function suiteWithPackages(name, packages, callback) {
	return suite(name, function() {
		const tempdir = fs.realpathSync('/tmp') + '/buildservice-test/' + uuid();

		before(function(done) {
			pfs.makeTree(tempdir)
			.then(function() {
				// Make some symbolic links to the test modules in this
				// repository in the temporary directory.  When the cache
				// tries to reclaim from disk it will pick up the modules
				// we've created symlinks to here
				return Promise.all(packages.map(function(name){
					const src = path.join(__dirname, '/testmodules/', name);
					const dst = path.join(tempdir, '/', name.replace(/^.*\//,''));
					return pfs.symbolicLink(dst, src, 'directory');
				}));
			})
			.done(function() { done(); });
		});

		callback.call(this, tempdir);

		after(function(){
			rmrf.sync(tempdir);
		});
	});
}

global.suiteWithPackages = suiteWithPackages;

function spawnTest(name, generatorCallback, shouldSkip) {
	let testFunc = test;
	if (shouldSkip) {
		testFunc = test.skip;
	}
	return testFunc(name, function(done) {
		promiseTest.call(this, generatorCallback, done);
	});
}


spawnTest.skip = test.skip.bind(test);
global.spawnTest = spawnTest;

function spawnTestWithTempdir(name, generatorCallback) {
	return test(name, function(done) {
		const tmpdir = fs.realpathSync('/tmp') + '/buildservice-test/' + uuid();

		const scopedGenerator = function*() {
			yield* generatorCallback.call(this, tmpdir);
		};

		promiseTest.call(this, scopedGenerator, done).then(function() {
			rmrf.sync(tmpdir);
		});
	});
}

function promiseTest(generatorCallback, done) {
	const testResult = Promise.resolve(Q.async(generatorCallback.bind(this))());

	return testResult.then(() => {
		done();
	}).catch((err) => {
		done(err);
	});
}

function bufferStream(stream) {
	return new Promise(function(resolve, reject) {
		let buffer = '';
		stream.on('data', function(data) {
			buffer += data.toString();
		});

		stream.on('end', function() {
			resolve(buffer);
		});

		stream.on('error', function(err) {
			reject(err);
		});
	});
}

spawnTestWithTempdir.skip = test.skip.bind(test);
global.spawnTestWithTempdir = spawnTestWithTempdir;

module.exports = {
	suiteWithPackages:suiteWithPackages,
	spawnTest:spawnTest,
	spawnTestWithTempdir: spawnTestWithTempdir,

	Q:Q,
	pfs: pfs,
	log: log,
	ModuleInstallation: ModuleInstallation,
	InstallationManager: InstallationManager,
	Output: Output,
	ModuleSet: ModuleSet,
	BuildSystem: BuildSystem,
	Bundler: Bundler,
	JsBundler: JsBundler,
	CssBundler: CssBundler,
	DemoCompiler: DemoCompiler,
	HealthMonitor: HealthMonitor,
	PromiseCache: PromiseCache,
	Registry: Registry,
	FileProxy: FileProxy,
	ModuleMetadata: ModuleMetadata,
	createApp: createApp,
	bufferStream: bufferStream
};
