// Code based on https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/testing.md
'use strict';

const proclaim = require('proclaim');
const File = require('vinyl');

const prefixer = require('../../lib/plugins/gulp-prefixer.js');

describe('gulp-prefixer', function() {
	describe('in buffer mode', function() {

		it('should prepend text', function(done) {

			const fakeFile = new File({
				contents: new Buffer('abufferwiththiscontent')
			});

			const myPrefixer = prefixer('prependthis');

			myPrefixer.write(fakeFile);

			myPrefixer.once('data', function(file) {
				proclaim.isTrue(file.isBuffer());
				proclaim.equal(file.contents.toString('utf8'), 'prependthisabufferwiththiscontent');
				done();
			});

		});

	});
});
