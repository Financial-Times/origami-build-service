'use strict';

const hostnames = require('../lib/utils/hostnames');
const redirectWithBody = require('../lib/express/redirect-with-body');
const URL = require('url');

const ONE_YEAR_SECONDS = 31536000;

module.exports = function(req, res) {
	const requestPath = URL.parse(req.url).path;
	const redirectUrl = requestPath.replace(new RegExp('^/(v1/)?'), req.basePath + 'v2/');
	const redirectBody = 'This endpoint has been removed. You are being redirected to ' + redirectUrl + '\nSee https://' + hostnames.preferred + '/v2/#api-reference for more information.\n';
	res.type('txt');
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Surrogate-Control', `public, max-age=${ONE_YEAR_SECONDS}, stale-while-revalidate=${ONE_YEAR_SECONDS}, stale-if-error=${ONE_YEAR_SECONDS}`);
	redirectWithBody(res, 301, redirectUrl, redirectBody);
};
