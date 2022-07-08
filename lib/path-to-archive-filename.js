'use strict';

const crypto = require('crypto');

module.exports = path => {
	// Remove any host and unexpected query params from the path.
	// A surprising number of pages are cache busting
	// Build Service requests dynamically.
	const expectedQueryParams = new Set([
		'modules',
		'export',
		'autoinit',
		'shrinkwrap',
		'brand',
		'source',
		'callback',
		'polyfills'
	]);

	// default to ft.com when no host is specified
	const tmpURL = new URL(path, 'https://ft.com');
	const queryParams = Array.from(tmpURL.searchParams.keys());
	queryParams.forEach(queryParam => {
		if(!expectedQueryParams.has(queryParam)) {
			tmpURL.searchParams.delete(queryParam);
		}
	});

	path = tmpURL.toString().replace(tmpURL.origin, '');

	// Same name regardless of host.
	// https://origami-build.ft.com/[...]
	// https://www.ft.com/__origami/service/build/[...]
	const pathWithoutOrigin = path.replace(/^\/?__origami\/service\/build\/?/, '').replace(/^\//, '');
	// Decode for human readability.
	const decodedPathWithoutOrigin = decodeURIComponent(pathWithoutOrigin);
	return decodedPathWithoutOrigin
		// Responses for one endpoint under one directory.
		// File for query param combination.
		.replace(/\?/, '/?')
		// Sanitise url. Keep select special characters for
		// human readability.
		.replace(/[^a-zA-Z0-9-_^,&?/]/g, '_')
		// Remove any slash from a query param (we decoded the url, and don't want
		// someone to manipulate the structure of our s3 bucket with a query param).
		.replace(/(?:[?])(?:.+)?[/]/g, '_')
		// Append hash to avoid conflicts having crudely sanitised the url.
		// Use hash of decoded path always.
		+ '-' +
	crypto.createHash('md5').update(decodedPathWithoutOrigin).digest('hex');
};
