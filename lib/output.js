'use strict';

const streamCat = require('streamcat');

/**
 * Represents a finished/processed output (file)
 *
 * @param {String} mimeType
 * @param {Buffer} content
 */
function Output(mimeType, bufferedContent, timeToLive) {
	if (bufferedContent === undefined) throw new Error('Output '+mimeType+' created with no content');

	this.mimeType = mimeType;
	this.createdTime = Date.now();
	this._timeToLive = timeToLive;
	this._content = bufferedContent;
}

Output.prototype = {
	get expiryTime() {
		return this.createdTime + this._timeToLive;
	},

	pipe: function(stream) {
		stream.write(this._content);
		return stream;
	},

	get stream() {
		return streamCat([this._content]);
	}
};

module.exports = Output;
