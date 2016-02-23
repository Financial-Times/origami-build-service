'use strict';

const request = require('supertest');
const testhelper = require('./testhelper');
const log = testhelper.log;
const BuildSystem = testhelper.BuildSystem;
const createApp = testhelper.createApp;

suiteWithPackages('serverhttp', [ 'test1' ], function(tempdir) {
	this.timeout(20*1000);

	spawnTest('200', function*() {
		const buildSystem = new BuildSystem({
			tempdir:tempdir,
			log:log,
			whitelist:'*'
		});

		const app = createApp({
			buildSystem: buildSystem
		});

		yield new Promise(function(resolve, reject) {
			request(app)
				.get('/bundles/css?modules=test1&newerthan=' + (new Date()).toISOString())
				.set('Connection', 'close')
				.expect(200)
				.end((e, result) => {
					if (e) {
						reject(e);
					} else {
						resolve(result);
					}
				});
		});
	});


    spawnTestWithTempdir('200 files', function*(tempdir) {
        const buildSystem = new BuildSystem({ tempdir: tempdir, log: log, whitelist: '*' });
		const app = createApp({
			buildSystem: buildSystem
		});

		yield new Promise(function(resolve, reject) {
			request(app)
				.get('/files/o-ft-icons@2.3.1/svg/arrow-up-down.svg')
				.expect(200)
				.end((e, result) => {
					if (e) {
						reject(e);
					} else {
						resolve(result);
					}
				});
		});
    });

    spawnTestWithTempdir('200 modules', function*(tempdir) {
        const buildSystem = new BuildSystem({ tempdir: tempdir, log: log, whitelist: '*' });
		const app = createApp({
			buildSystem: buildSystem
		});

		yield new Promise(function(resolve, reject) {
			request(app)
				.get('/modules/o-ft-icons@2.3.1')
				.expect(200)
				.end((e, result) => {
					if (e) {
						reject(e);
					} else {
						resolve(result);
					}
				});
		});
    });

    spawnTestWithTempdir('v1 200 modules', function*(tempdir) {
        const buildSystem = new BuildSystem({ tempdir: tempdir, log: log, whitelist: '*' });
		const app = createApp({
			buildSystem: buildSystem
		});

		yield new Promise(function(resolve, reject) {
			request(app)
				.get('/v1/modules/o-ft-icons@2.3.1')
				.expect(200)
				.end((e, result) => {
					if (e) {
						reject(e);
					} else {
						resolve(result);
					}
				});
		});
    });

    spawnTestWithTempdir('v1 200 files', function*(tempdir) {
        const buildSystem = new BuildSystem({ tempdir: tempdir, log: log, whitelist: '*' });
		const app = createApp({
			buildSystem: buildSystem
		});
		yield new Promise(function(resolve, reject) {
			request(app)
				.get('/v1/files/o-ft-icons@2.3.1/svg/arrow-up-down.svg')
				.expect(200)
				.end((e, result) => {
					if (e) {
						reject(e);
					} else {
						resolve(result);
					}
				});
		});
    });

	spawnTestWithTempdir('404', function*(tempdir) {
        const buildSystem = new BuildSystem({ tempdir: tempdir, log: log, whitelist: '*' });
		const app = createApp({
			buildSystem: buildSystem
		});

		yield new Promise(function(resolve, reject) {
			return request(app)
				.get('/bundles/css?modules=o-invalid404error&newerthan=' + (new Date()).toISOString())
				.set('Connection', 'close')
				.expect(404, '/*\n\nPackage o-invalid404error not found\n\n{\n  "endpoint": {\n    "name": "o-invalid404error",\n    "source": "o-invalid404error",\n    "target": "*"\n  }\n}\n\n*/\n')
				.end((e, result) => {
					if (e) {
						reject(e);
					} else {
						resolve(result);
					}
				});
		});
	});
});
