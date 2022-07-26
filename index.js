'use strict';

const buildService = require('./lib/build-service');
const dotenv = require('dotenv');

dotenv.config({
	silent: true,
});
const options = {
	defaultLayout: 'main',
	httpProxyTtl: 12 * 3600 * 1000,
	installationTtl: 24 * 3600 * 1000,
	installationTtlExact: 3 * 24 * 3600 * 1000,
	log: console,
	metricsAppName: 'origami-build-service',
	name: 'Origami Build Service',
	tempdir: `/tmp/buildservice-${process.pid}/`,
	testHealthcheckFailure: process.env.TEST_HEALTHCHECK_FAILURE || false,
	npmRegistryURL: process.env.NPM_REGISTRY_URL || 'https://registry.npmjs.org',
	archiveBucketName: process.env.ARCHIVE_BUCKET_NAME || 'origami-build-service-archive-prod'
};

buildService(options)
	.listen()
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
