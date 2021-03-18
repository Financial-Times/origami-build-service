'use strict';

function cacheControlHeaderFromExpiry(expiryTime) {
	// Don't output negative max-age if the bundle expired.
	// Cache for at least 120 seconds to give the buildservice time to rebuild the bundle.
	const maxAge = Math.max(120, Math.ceil((expiryTime - Date.now()) / 1000));

	const header = 'public, max-age=' + maxAge;

	return header;
}

module.exports = cacheControlHeaderFromExpiry;
