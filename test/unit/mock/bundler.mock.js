'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const bundler = module.exports = sinon.stub();

bundler.getBundle = sinon.stub();
bundler._createContentStream = sinon.stub();
bundler._getMimeType = sinon.stub();
bundler._bundleCache = sinon.stub();
bundler.pipe = sinon.stub();

bundler.returns({
	getBundle: bundler.getBundle,
	_createContentStream: bundler._createContentStream,
	_getMimeType: bundler._getMimeType,
	_bundleCache: bundler._bundleCache
});
