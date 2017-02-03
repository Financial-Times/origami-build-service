'use strict';

const fs = require('fs');
const path = require('path');
const oneWeek = 60 * 60 * 24 * 7;
const handleDeprecatedRoute = require('../../deprecated/v1-deprecated');

module.exports = function(app) {

	const docsDirectory = app.origami.options.docsDirectory || path.join(__dirname, '/../../docs');
	const pathToDocsFile = path.join(docsDirectory, 'index.html');

	// Sync operation only happens once during startup
	let documentation = fs.readFileSync(pathToDocsFile, 'utf-8');

	app.get('/', handleDeprecatedRoute);
	app.get('/v1/', handleDeprecatedRoute);
	app.get('/v2/', showDocumentation);

	function showDocumentation(req, res) {
		res.set({
			'Content-Type': 'text/html',
			'Cache-Control': 'public, stale-while-revalidate=' + oneWeek + ', max-age=' + oneWeek
		});
		res.send(documentation.replace(/\{\{basePath\}\}/g, req.basePath));
	}

};
