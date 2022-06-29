'use strict';

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const Raven = require('raven');

const s3BundleArchiveClient = new S3Client({ region: 'eu-west-1' });

const pathToFilename = path => {
	// Same name regardless of host.
	// https://origami-build.ft.com/[...]
	// https://www.ft.com/__origami/service/build/[...]
	const pathWithoutOrigin = path.replace(/.+build\//g, '').replace(/^\//, '');
	// Decode for human readability.
	return decodeURIComponent(pathWithoutOrigin)
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
		+ '-' +
	crypto.createHash('md5').update(pathWithoutOrigin).digest('hex');
};

module.exports = function (app) {
	const {metrics} = app.ft;

	return async function outputBundle(req, res, next) {
		try {
			const archiveSetting = process.env.ARCHIVE;
			if(!archiveSetting || archiveSetting === 'skip') {
				return next();
			}

			const archivedFilename = pathToFilename(req.originalUrl);

			let s3Response;
			try {
				s3Response = await s3BundleArchiveClient.send(new GetObjectCommand({
					Bucket: 'origami-build-service-v2-bundles-archive-test',
					Key: archivedFilename
				}));
			} catch (error) {
				s3Response = error;
			}

			const noSuchKey = (s3Response instanceof Error && s3Response.Code === 'NoSuchKey');
			if(noSuchKey || s3Response.Body === undefined) {
				metrics.count('archive.miss', 1);
				if(archiveSetting === 'fallback') {
					return next();
				}
				const obsError = new Error('Origami Build Service v2 is decommissioned. Could not find in archive.');
				obsError.status = 404;
				return next(obsError);
			}

			if(s3Response instanceof Error) {
				metrics.count('archive.fail', 1);
				Raven.captureException(s3Response);
				if(archiveSetting === 'fallback') {
					console.log('FALLBACK');
					return next();
				}
				const obsError = new Error(`Could not access the v2 archive. Contact the Origami team for support. (AWS S3 Code: ${error.Code}).`);
				obsError.status = 500;
				return next(obsError);
			}

			metrics.count('archive.hit', 1);

			res.set({
				'Content-Type': s3Response.ContentType,
				'X-Content-Type-Options': 'nosniff',
				'Last-Modified': s3Response.LastModified,
				// Short cache 5-10 minutes chosen during rollout. Can be made much longer.
				'Cache-Control': 'public, max-age=300, stale-while-revalidate=600, stale-if-error=600, s-maxage=600'
			});

			s3Response.Body.pipe(res);
		} catch (error) {
			metrics.count('archive.fail', 1);
			const obsError = new Error('Origami Build Service v2 is decommissioned. Error trying to fetch from archive.');
			obsError.status = 500;
			return next(obsError);
		}
	};
};
