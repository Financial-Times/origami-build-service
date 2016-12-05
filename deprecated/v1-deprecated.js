'use strict';

const hostnames = require('../lib/utils/hostnames');
const redirectWithBody = require('../lib/express/redirect-with-body');
const URL = require('url');

module.exports = function(req, res) {
	const requestPath = URL.parse(req.url).path;
	let redirectUrl;
	if (requestPath.indexOf('/v1') !== -1) {
		redirectUrl = requestPath.replace(new RegExp('^/v1/'), req.basePath + 'v2/');
	} else {
		redirectUrl = requestPath.replace(new RegExp('^/'), req.basePath + 'v2/');
	}
	const redirectBody = 'This endpoint has been removed. You are being redirected to ' + redirectUrl + '\nSee https://' + hostnames.preferred + '/v2/#api-reference for more information.\n';
	res.type('txt');
	res.header('Access-Control-Allow-Origin', '*');
	redirectWithBody(res, 301, redirectUrl, redirectBody);
};
