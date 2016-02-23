'use strict';

const crypto = require('crypto');

// Transforms arbitrary string into ASCII up to maxLength characters, preserving uniqueness by hashing if necessary.
module.exports = function uniqueid(id, maxLength) {
	const AsciiId = id.replace(/[^0-9A-Za-z!;,.'+_-]/g,'_');
	if (AsciiId !== id || id.length > maxLength) {
		const shasum = crypto.createHash('sha1');
		shasum.update(id);
		return AsciiId.substring(0, maxLength - 24) + shasum.digest('base64').substring(0, 24).replace(/\//g,'_');
	}
	return AsciiId;
};
