'use strict';

const buildService = require('../..');
const mkdirp = require('mkdirp');
const rmrf = require('rimraf');
const uuid = require('uuid').v4;
const process = require('process');

const tempdir = `/tmp/buildservice/tests-${uuid()}`;
const log = require('../mock/log.mock');
const HOST = process.env.HOST;

const chai = require('chai');
const chaiJestSnapshot = require('chai-jest-snapshot');

chai.use(chaiJestSnapshot);

chai.assert.matchSnapshot = function matchSnapshot(object, ...args) {
	chai.expect(object).to.matchSnapshot(...args);
};

beforeEach(function() {
	chaiJestSnapshot.configureUsingMochaContext(this);
});

before(function() {
	chaiJestSnapshot.resetSnapshotRegistry();
	mkdirp.sync(tempdir);
	// If HOST is defined, we are wanting to test a real server and not the local express app in this project.
	if (HOST) {
		return new Promise(resolve => {
			this.app = HOST;
			resolve();
		});
	} else {
		return buildService({
			defaultLayout: 'main',
			environment: 'test',
			log: log,
			port: 0,
			requestLogFormat: null,
			graphiteApiKey: 'xxx',
			staticBundlesDirectory: `${__dirname}/mock-static-bundles`,
			npmRegistryURL: process.env.NPM_REGISTRY_URL || 'https://registry.npmjs.org',
			archiveBucketName: process.env.ARCHIVE_BUCKET_NAME || 'origami-build-service-archive-test',
			tempdir
		})
			.listen()
			.then(app => {
				this.app = app;
			});
	}
});

after(function() {
	// If HOST is not defined, we are testing the local express app in this project and need to stop the server to let the process exit.
	if (!HOST) {
		this.app.ft.server.close();
		rmrf.sync(tempdir);
	}
});
