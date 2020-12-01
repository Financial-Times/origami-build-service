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

/**
 * Installs pacakges into the npm cache
 *
 * @param {String} pkg The name of an npm package to add to the npm cache
 * @param {String} registry The npm Registry url to use when installing the package
 * @returns {Promise<void>}
 */
async function cache(pkg, registry) {
	await execa(
		'npm',
		[
			'cache',
			'add',
			pkg,
			`--registry=${registry}`,
		],
		{
			preferLocal: true,
		}
	);
}

/**
 * Prime the npm cache with the latest version of Origami components
 *
 * @param {String} registry The npm Registry url to use when installing the package
 * @returns {Promise<void>}
 */
async function primeNpmCache(registry) {
	for (const component of components) {
		try {
			await cache(component, registry);
			console.log(`Cached ${component}.`);
		} catch (err) {
			console.error(`Failed to cache ${component}.`);
			throw err;
		}
	}
}

module.exports = {
	primeNpmCache,
};
