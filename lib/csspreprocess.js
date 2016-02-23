'use strict';

const CleanCSS = require('clean-css');
const autoprefixer = require('autoprefixer-core');

module.exports.minify = function(css) {
	const cleanCss = new CleanCSS({ advanced: false });
	return new Promise(function(resolve, reject) {
		cleanCss.minify(css, function(errors, minifiedCss) {
			if (errors) {
				reject(errors);
				return;
			}

			resolve(minifiedCss.styles);
		});
	});
};

module.exports.autoprefixer = function(css) {
	return new Promise(function(resolve) {
		const options = {
			browsers: ['> 1%', 'last 2 versions', 'ie > 6', 'ff ESR'],
		   	cascade: false,
			remove: true
		};

		const prefixer = autoprefixer(options);
		resolve(prefixer.process(css).css);
	});
};
