'use strict';

const createRouteHandler = require('../express/promisehandler');
const hostnames = require('../utils/hostnames');
const redirectWithBody = require('../express/redirect-with-body');
const URL = require('url');

module.exports = function(app, config) {
	const buildSystem = config.buildSystem;

	// Install routes
	app.get(/^\/modules\/[^\/]+$/, handleDeprecatedRoute);
	app.get(/^\/v1\/modules\/[^\/]+$/, handleDeprecatedRoute);
	app.get(/^\/v2\/modules\/[^\/]+$/, createRouteHandler(moduleMetadata));

	// Handlers
	function moduleMetadata(req, res) {
		return buildSystem.outputModuleMetadata(req, res);
	}

	function handleDeprecatedRoute(req, res) {
		const redirectUrl = '/v2' + URL.parse(req.url).path.replace(/^\/v1/, '');
		const redirectBody = 'This endpoint has been deprecated. You are being redirected to ' + redirectUrl + '\nSee https://' + hostnames.preferred + '/v2/#api-reference for more information.\n';
		res.type('txt');
		res.header('Access-Control-Allow-Origin', '*');
		redirectWithBody(res, 301, redirectUrl, redirectBody);
	}

};
