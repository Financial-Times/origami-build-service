'use strict';

const execa = require('execa');
const components = [
	'@financial-times/o-ads',
	'@financial-times/o-assets',
	'@financial-times/o-audio',
	'@financial-times/o-autoinit',
	'@financial-times/o-banner',
	'@financial-times/o-big-number',
	'@financial-times/o-brand',
	'@financial-times/o-buttons',
	'@financial-times/o-colors',
	'@financial-times/o-comments',
	'@financial-times/o-cookie-message',
	'@financial-times/o-crossword',
	'@financial-times/o-date',
	'@financial-times/o-editorial-layout',
	'@financial-times/o-editorial-typography',
	'@financial-times/o-errors',
	'@financial-times/o-expander',
	'@financial-times/o-fonts-assets',
	'@financial-times/o-fonts',
	'@financial-times/o-footer-services',
	'@financial-times/o-footer',
	'@financial-times/o-forms',
	'@financial-times/o-ft-affiliate-ribbon',
	'@financial-times/o-gallery',
	'@financial-times/o-grid',
	'@financial-times/o-header-services',
	'@financial-times/o-header',
	'@financial-times/o-icons',
	'@financial-times/o-labels',
	'@financial-times/o-layers',
	'@financial-times/o-layout',
	'@financial-times/o-lazy-load',
	'@financial-times/o-loading',
	'@financial-times/o-message',
	'@financial-times/o-meter',
	'@financial-times/o-normalise',
	'@financial-times/o-overlay',
	'@financial-times/o-quote',
	'@financial-times/o-share',
	'@financial-times/o-spacing',
	'@financial-times/o-squishy-list',
	'@financial-times/o-stepped-progress',
	'@financial-times/o-subs-card',
	'@financial-times/o-syntax-highlight',
	'@financial-times/o-table',
	'@financial-times/o-tabs',
	'@financial-times/o-teaser-collection',
	'@financial-times/o-teaser',
	'@financial-times/o-test-component',
	'@financial-times/o-toggle',
	'@financial-times/o-tooltip',
	'@financial-times/o-topper',
	'@financial-times/o-tracking',
	'@financial-times/o-typography',
	'@financial-times/o-utils',
	'@financial-times/o-video',
	'@financial-times/o-viewport',
	'@financial-times/o-visual-effects',
];
function cache(pkg) {
	return execa(
		'npm',
		[
			'cache',
			'add',
			pkg,
			'--registry=https://origami-npm-registry-prototype.herokuapp.com',
		],
		{
			preferLocal: true,
		}
	);
}

/**
 * Prime the npm cache with the latest version of Origami components
 *
 * @returns {Promise<void>}
 */
async function primeNpmCache() {
	await Promise.all(components.map(cache));
}

module.exports = {
	primeNpmCache,
};
