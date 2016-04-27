'use strict';

const hostnames = require('../lib/utils/hostnames');
const redirectWithBody = require('../lib/express/redirect-with-body');
const URL = require('url');

module.exports = function(req, res) {
	const redirectUrl = '/v2' + URL.parse(req.url).path.replace(/^\/v1/, '');
	const redirectBody = 'This endpoint has been removed. You are being redirected to ' + redirectUrl + '\nSee https://' + hostnames.preferred + '/v2/#api-reference for more information.\n';
	res.type('txt');
	res.header('Access-Control-Allow-Origin', '*');
	redirectWithBody(res, 301, redirectUrl, redirectBody);
};
