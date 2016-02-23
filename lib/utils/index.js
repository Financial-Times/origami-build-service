'use strict';

const oneWeek = 60 * 60 * 24 * 7;


function cacheControlHeaderFromExpiry(expiryTime) {
	// Don't output negative max-age if the bundle expired.
	// Cache for at least 120 seconds to give the buildservice time to rebuild the bundle.
	const maxAge = Math.max(120, Math.ceil((expiryTime - Date.now()) / 1000));

	// Limit lifetime of files in shared caches (CDN), since it's cheaper for the CDN to reload things,
	// and we don't want hassle of purging files from the CDN.
	const sMaxAge = Math.ceil(this.httpProxyTtl / 1000);

	const staleWhileRevalidate = 'stale-while-revalidate=' + (maxAge + oneWeek);
	const staleIfError = 'stale-if-error=' + (maxAge + oneWeek);

	const header = 'public, max-age=' + maxAge + ', ' + staleWhileRevalidate + ', ' + staleIfError;

	if (maxAge > sMaxAge) {
		return header + ', s-maxage=' + sMaxAge;
	}

	return header;
}


module.exports = {
	cacheControlHeaderFromExpiry: cacheControlHeaderFromExpiry
};
