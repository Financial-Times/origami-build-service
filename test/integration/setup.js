'use strict';

const buildService = require('../..');
const mkdirp = require('mkdirp');
const rmrf = require('rimraf');
const uuid = require('uuid');

const tempdir = `/tmp/buildservice/tests-${uuid()}`;
const noop = () => {};
const mockLog = {
	info: noop,
	error: noop,
	warn: noop
};

before(function() {
	mkdirp.sync(tempdir);
	return buildService({
		defaultLayout: 'main',
		environment: 'test',
		log: mockLog,
		port: null,
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
	this.app.origami.server.close();
	rmrf.sync(tempdir);
});
