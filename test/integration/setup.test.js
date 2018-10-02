'use strict';

const buildService = require('../..');
const mkdirp = require('mkdirp');
const rmrf = require('rimraf');
const uuid = require('uuid');

const tempdir = `/tmp/buildservice/tests-${uuid()}`;
const log = require('../unit/mock/log.mock');

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
