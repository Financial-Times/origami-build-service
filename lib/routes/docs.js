'use strict';

const fs = require('fs');
const path = require('path');
const oneWeek = 60 * 60 * 24 * 7;
const hostnames = require('../utils/hostnames');

module.exports = function(app, config) {

	const docsDirectory = config.docsDirectory || path.join(__dirname, '/../../docs');
	const pathToDocsFile = path.join(docsDirectory, 'index.html');

	// Sync operation only happens once during startup
	let documentation = fs.readFileSync(pathToDocsFile, 'utf-8');
	documentation = documentation.replace(/\{\{build-service-hostname\}\}/g, hostnames.preferred);

	app.get('/', (req, res) => res.redirect('/v2/'));
	app.get('/v1/', (req, res) => res.redirect('/v2/'));

	app.get('/v2/', (req, res) => {
		res.set({
			'Content-Type': 'text/html',
			'Cache-Control': 'public, stale-while-revalidate=' + oneWeek + ', max-age=' + oneWeek
		});
		res.send(documentation);
	});
};
