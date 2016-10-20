'use strict';

// We only want one reference to the hostname in the code
exports.preferred = process.env.PREFERRED_HOSTNAME || 'origami-build.ft.com';

// A list of the hostnames that we know can hit the build service
exports.known = [
	'build.origami.ft.com',
	'buildservice-fastly.ft.com',
	'buildservice.ft.com',
	'origami-build.ft.com',
  'origami-build-qa.ft.com',
  'origami-build-ci.ft.com',
	'origami-buildservice-eu.herokuapp.com',
	'origami-buildservice-qa.herokuapp.com'
];
