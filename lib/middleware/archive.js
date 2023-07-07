'use strict';

const Raven = require('raven');
const axios = require('axios').default;
const pathToFilename = require('../path-to-archive-filename');
const isFontDeprecated = require('../utils/isFontDeprecated');

module.exports = function (app) {
	const {metrics} = app.ft;

	return async function outputBundle(req, res, next) {
		if(req.originalUrl.includes('/files/o-fonts-assets')) {
			const fontFileName = req.originalUrl.replace(/^\/__origami\/service\/build\/v2\/files\/o-fonts-assets@.*\//, '');

			if(isFontDeprecated(fontFileName.split('.')[0])) {
				const obsError = new Error(`Origami Build Service returned an error: The font '${fontFileName}' is deprecated, we no longer have a license to use it. Please contact Origami Team for advice on which font to use instead.`);
				obsError.status = 410;
				return next(obsError);
			}
		}
		try {
			const archivedFilename = pathToFilename(req.originalUrl);

			let s3Result;
			try {

				const s3url = `https://${app.ft.options.archiveBucketName}.s3.eu-west-1.amazonaws.com/${encodeURIComponent(archivedFilename)}`;

				s3Result = await axios({
					url: s3url,
					method: 'get',
					responseType: 'stream'
				});

			} catch (error) {
				s3Result = error;
			}

			if(s3Result.response && s3Result.response.status === 404) {
				metrics.count('archive.404', 1);
				const obsError = new Error('Origami Build Service v2 is decommissioned and the requested url has not been archived. Speak to the Origami team for support. Further information including migration guides can be found in the following post: https://origami.ft.com/blog/2021/07/01/origami-on-npm-and-how-to-migrate/');
				obsError.status = 404;
				return next(obsError);
			}

			if(s3Result instanceof Error) {
				metrics.count('archive.fail', 1);
				Raven.captureException(s3Result);
				const obsError = new Error(`Origami Build Service v2 is decommissioned and accessing the archive has returned an error. Contact the Origami team for support. (S3 Status: ${s3Result.response.status}). Further information including migration guides can be found in the following post: https://origami.ft.com/blog/2021/07/01/origami-on-npm-and-how-to-migrate/`);
				obsError.status = 500;
				return next(obsError);
			}

			metrics.count('archive.hit', 1);

			res.set({
				'Content-Type': s3Result.headers['content-type'],
				'X-Content-Type-Options': 'nosniff',
				'Last-Modified': s3Result.headers['last-modified'],
				'Content-Length': s3Result.headers['content-length'],
				// Short cache 5-10 minutes chosen during rollout. Can be made much longer.
				'Cache-Control': 'public, max-age=300, stale-while-revalidate=600, stale-if-error=600, s-maxage=600'
			});

			s3Result.data.pipe(res);
		} catch (error) {
			metrics.count('archive.fail', 1);
			const obsError = new Error('Origami Build Service v2 is decommissioned and accessing the archive has returned an unexpected error. Please contact the Origami team for support. Further information including migration guides can be found in the following post: https://origami.ft.com/blog/2021/07/01/origami-on-npm-and-how-to-migrate/');
			obsError.status = 500;
			return next(obsError);
		}
	};
};
