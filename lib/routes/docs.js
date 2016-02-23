'use strict';

const fs = require('fs');
const path = require('path');
const oneWeek = 60 * 60 * 24 * 7;

module.exports = function(app, config) {

	const docsDirectory = config.docsDirectory || path.join(__dirname, '/../../docs');

	app.get('/', (req, res) => res.redirect('/v2/'));
	app.get('/v1/', (req, res) => res.redirect('/v2/'));

	app.get('/v2/', (req, res) => {

		const pathToDocsFile = path.join(docsDirectory, 'index.html');

		res.set({
			'Content-Type': 'text/html',
			'Cache-Control': 'public, stale-while-revalidate=' + oneWeek + ', max-age=' + oneWeek
		});

		fs.createReadStream(pathToDocsFile).pipe(res);
	});
};
