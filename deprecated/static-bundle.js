'use strict';

const fs = require('fs');
const path = require('path');
const pfs = require('fs-extra-p');
const uniqueid = require('../lib/utils/uniqueid');
const URL = require('url');

const defaultStaticBundlesDirectory = path.resolve(__dirname, 'static-bundles');

function getStaticBundleStream(url, staticBundlesDirectory) {
	const filePath = module.exports.getStaticBundleFilePath(url, staticBundlesDirectory);
	return pfs.stat(filePath).then((stats) => {
		if (!stats.isFile()) {
			throw new Error('Static bundle is not a file');
		}
		return fs.createReadStream(filePath);
	});
}

function getStaticBundleFilePath(url, staticBundlesDirectory) {
	const baseDir = staticBundlesDirectory || defaultStaticBundlesDirectory;
	const requestHash = uniqueid(decodeURI(URL.parse(url).path), 64);
	return path.resolve(baseDir, requestHash);
}

module.exports = {
	getStaticBundleStream,
	getStaticBundleFilePath
};
