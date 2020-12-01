'use strict';

const buildService = require('../..');
const mkdirp = require('mkdirp');
const rmrf = require('rimraf');
const uuid = require('uuid').v4;

const tempdir = `/tmp/buildservice/tests-${uuid()}`;
const log = require('../mock/log.mock');

before(function() {
	mkdirp.sync(tempdir);
	return buildService({
		defaultLayout: 'main',
		environment: 'test',
		log: log,
		port: 0,
		requestLogFormat: null,
		graphiteApiKey: 'xxx',
		staticBundlesDirectory: `${__dirname}/mock-static-bundles`,
		npmRegistryURL: process.env.NPM_REGISTRY_URL || 'https://origami-npm-registry-prototype.herokuapp.com',
		tempdir
	})
	.listen()
	.then(app => {
		this.app = app;
	});
});

after(function() {
	this.app.ft.server.close();
	rmrf.sync(tempdir);
});
