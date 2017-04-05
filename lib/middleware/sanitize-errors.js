'use strict';

const CompileError = require('../utils/compileerror');
const UserError = require('../utils/usererror');

module.exports = sanitizeErrors;
module.exports.formatErrorMessage = formatErrorMessage;

function sanitizeErrors() {
	return (error, request, response, next) => {
		const {metrics} = request.app.origami;

		// Format the error message if required
		error.message = module.exports.formatErrorMessage(error);

		// Compilation errors use the non-standard 560 status
		if (error instanceof CompileError || error.type === 'CompileError') {
			metrics.count('servererrors.compile', 1);
			error.status = 560;
			return next(error);
		}

		// User errors get a 400 status
		if (error instanceof UserError || error.type === 'UserError') {
			error.status = 400;
			return next(error);
		}

		// Several different error codes indicate that a resource cannot be found
		if (error.code === 'ENOTFOUND' || error.code === 'ENOENT' || error.code === 'ENORESTARGET') {
			error.status = 404;
			return next(error);
		}

		// Bundle conflicts get a 409 status
		if (error.code === 'ECONFLICT') {
			metrics.count('usererrors.conflict', 1);
			error.status = 409;
			return next(error);
		}

		// Remote IO errors and similar are bad gateway errors
		if (error.code === 'EREMOTEIO' || error.code === 'EAI_AGAIN') {
			metrics.count('servererrors.remoteio', 1);
			error.status = 502;
			return next(error);
		}

		next(error);
	};
}

function formatErrorMessage(error) {
	let message = error.message;

	// Conflict errors have some useful information we can pick out
	if (error.code === 'ECONFLICT' && error.picks) {
		const picks = error.picks.map(pick => {
			const requiredBy = pick.dependants.map(dependent => {
				if (dependent.pkgMeta.name === '__MAIN__') {
					return 'in the URL';
				}
				return `by ${dependent.pkgMeta.name}@${dependent.pkgMeta._target}`;
			});
			return ` - Required at version ${pick.endpoint.target} ${requiredBy.join('\n')}`;
		});
		return `Cannot complete build: conflicting dependencies exist.\n\n${message}\n${picks.join('\n')}`;
	}

	// Compile errors need additional context
	if (error.type === 'CompileError') {
		return `Cannot complete build due to compilation error from build tools:\n\n${message}\n`;
	}

	// Some errors are augmented with a `details` property
	if (typeof error.details === 'string') {
		message = `${message}\n${error.details}`;
	}

	// Not found errors sometimes have a `data` property
	if ((error.code === 'ENOTFOUND' || error.code === 'ENORESTARGET') && error.data) {
		const errorJson = JSON.stringify(error.data, undefined, 2);
		return `${message}\n\n${errorJson}`;
	}

	return message;
}
