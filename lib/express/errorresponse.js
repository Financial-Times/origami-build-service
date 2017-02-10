'use strict';

const CompileError = require('../utils/compileerror');
const UserError = require('../utils/usererror');
const metrics = require('../monitoring/metrics');

module.exports = function (err, req, res, next) {
	const headers = {
		'Content-Type': 'text/plain;charset=UTF-8',
		'Cache-Control': 'public, s-maxage=5, max-age=20',
	};
	let msg;
	let httpStatus = 500;

	metrics.counter('errors').inc();

	if (res.headersSent) {
		res.end();
	} else {

		if (err.statusCode >= 300) {
			httpStatus = err.statusCode;

		// AB: The instance loses its constructor, not sure why, hence the .type hack
		} else if (err instanceof CompileError || err.type === 'CompileError') {
			httpStatus = 560;
			metrics.counter('servererrors.compile').inc();
		} else if (err instanceof UserError || err.type === 'UserError') {
			httpStatus = 400;
		} else if (err.code === 'ENOTFOUND' || err.code === 'ENOENT' || err.code === 'ENORESTARGET') {
			httpStatus = 404;
		} else if (err.code === 'ECONFLICT') {
			httpStatus = 409;
			metrics.counter('usererrors.conflict').inc();
		} else if (err.code === 'EREMOTEIO' || err.code === 'EAI_AGAIN') {
			httpStatus = 502;
			metrics.counter('servererrors.remoteio').inc();
		}

		msg = getFormattedError(err);

		if (process.env.NODE_ENV === 'development') {
			msg += '\n\n===========================================================\n';
			msg += 'Stack (shown because NODE_ENV=development):\n\n' + (err.stack || 'no stacktrace available ');
			msg += '\n===========================================================\n';
		}
		res.writeHead(httpStatus, headers);
		res.end('/*\n\n' + msg.replace(/\*\//g, '* /') + '\n\n*/\n');
	}

	// Allow more error handlers
	if (httpStatus === 500) next(err);
};

/**
 * Extracts information from Error objects, makes it human-readable.
 *
 * @param  {Error} err
 * @return {String}
 */
function getFormattedError(err) {
	let msg;
	if (err.code === 'ECONFLICT' && err.picks) {
		msg = 'Cannot complete build: conflicting dependencies exist.\n\n' + err.message + '\n';

		msg += err.picks.map(function(pick) {
			const requiredBy = pick.dependants.map(function(dep){
				return dep.pkgMeta.name === '__MAIN__' ? 'in the URL' : 'by ' + dep.pkgMeta.name + '@' + dep.pkgMeta._target;
			}).join(', ');

			return ' - Required at version ' + pick.endpoint.target + ' ' + requiredBy;
		}).join('\n');
	}
	else if (err.type === 'CompileError') {
		msg = 'Cannot complete build due to compilation error from build tools:\n\n'+err.message + '\n';
	}
	else if ((err.code === 'ENOTFOUND' || err.code === 'ENORESTARGET') && err.data) {
		msg = err.message;
		if (err.details) msg += '\n' + err.details;
		msg += '\n\n' + JSON.stringify(err.data, undefined, 2);
	} else {
		msg = '' + (err.message || err);

		if ('string' === typeof err.details) {
			msg += '\n' + err.details;
		}
	}

	return msg;
}

// Export for testing
module.exports.getFormattedError = getFormattedError;
