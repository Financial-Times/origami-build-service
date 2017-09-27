'use strict';

// We only want one reference to the hostname in the code
exports.preferred = process.env.PREFERRED_HOSTNAME || 'www.ft.com/__origami/service/build';

// A list of the hostnames/paths that we know can hit the build service
exports.known = [
	'www.ft.com/__origami/service/build',
	'www.ft.com',
	'origami-build-service-eu.herokuapp.com',
	'origami-build-service-us.herokuapp.com',
	'origami-build-service-qa.herokuapp.com'
];
