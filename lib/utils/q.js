'use strict';
const HTTPError = require('../express/httperror');
const Q = require('q');
const domain = require('domain');

/**
 * Captures all errors using node's domain, adds context to captured errors
 *
 * @param {Object} context First context arg is optional
 * @param {Object} callback
 */
Q.captureErrors = function(context, callback) {
	const def = Q.defer();

	if (!callback) {
		callback = context;
		context = new Error('Q.captureErrors');
	}

	function reject(err){
		if ('object' === typeof err) {
			if (err.context && 'object' === typeof context) {
				context.previousContext = err.context;
			}
			err.context = context;
		}
		def.reject(err);
	}

	try {
		const d = domain.create();
		d.on('error', reject);
		const promise = d.run(callback.bind(undefined)); // Domain runs callback in its own context, which is unexpected and error-prone
		if (promise && promise.then) {
			promise.then(def.resolve, reject, def.notify);
		} else {
			const tmp = new Error('Callback failed to return Promise');
			tmp.context = {
				returned: promise,
				context: context,
				callback: callback,
			};
			reject(tmp);
		}
	}
	catch(e) {
		reject(e);
	}

	return def.promise;
};

Q.bufferStream = function(stream) {
	return Q.streamIntoBuffer(stream).then(buf=>buf.toString());
};

Q.streamIntoBuffer = function(stream) {
	return new Promise(function(resolve, reject) {
		const chunks = [];

		stream.on('data', function(chunk) {
			chunks.push(chunk);
		});

		stream.on('error', reject);

		stream.on('end', function() {
			resolve(Buffer.concat(chunks));
		});
	});
};

/**
 * Wait on readable stream and return result from 'end' event
 */
Q.getStreamEnd = function(emitter) {
	const def = Q.defer();
	emitter.on('end', def.resolve);
	emitter.on('log', def.notify);
	emitter.on('error', def.reject);
	return def.promise;
};

/**
 * Wait on writeable stream until 'finish' event
 */
Q.waitStreamFinish = function(emitter) {
	const def = Q.defer();
	emitter.on('finish', def.resolve);
	emitter.on('error', def.reject);
	return def.promise;
};

/**
 * Throws error if promise isn't resolved before time elapses
 *
 * @param  {Number} ms      timeout in ms
 * @param  {Promise} promise Promise to wait for
 * @return {Promise}
 */
Q.maxWait = function(ms, promise, msg) {
	const def = Q.defer();
	const errorWithNiceStack = new HTTPError(504, msg + ' timed out after '+(ms/1000)+'s');

	const timer = setTimeout(function(){
		def.reject(errorWithNiceStack);
	}, ms);

	promise.then(function(value) {
		clearTimeout(timer);
		def.resolve(value);
	}, function(err) {
		clearTimeout(timer);
		def.reject(err);
	}, def.notify);

	return def.promise;
};

module.exports = Q;
