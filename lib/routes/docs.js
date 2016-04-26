'use strict';

const fs = require('fs');
const path = require('path');
const oneWeek = 60 * 60 * 24 * 7;
const hostnames = require('../utils/hostnames');
const redirectWithBody = require('../express/redirect-with-body');

module.exports = function(app, config) {

	const docsDirectory = config.docsDirectory || path.join(__dirname, '/../../docs');
	const pathToDocsFile = path.join(docsDirectory, 'index.html');

	// Sync operation only happens once during startup
	let documentation = fs.readFileSync(pathToDocsFile, 'utf-8');
	documentation = documentation.replace(/\{\{build-service-hostname\}\}/g, hostnames.preferred);

	app.get('/', handleDeprecatedRoute);
	app.get('/v1/', handleDeprecatedRoute);
	app.get('/v2/', showDocumentation);

	function showDocumentation(req, res) {
		res.set({
			'Content-Type': 'text/html',
			'Cache-Control': 'public, stale-while-revalidate=' + oneWeek + ', max-age=' + oneWeek
		});
		res.send(documentation);
	}

	function handleDeprecatedRoute(req, res) {
		const redirectUrl = '/v2/';
		const redirectBody = 'This endpoint has been deprecated. You are being redirected to ' + redirectUrl + '\nSee https://' + hostnames.preferred + '/v2/#api-reference for more information.\n';
		res.type('txt');
		redirectWithBody(res, 301, '/v2/', redirectBody);
	}

};
