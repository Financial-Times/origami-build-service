'use strict';

const esbuild = require('esbuild');
const path = require('path');
const babel = require('@babel/core');

const babelPlugin = {
	name: 'babel',
	setup(build) {
		const path = require('path');
		const fs = require('fs');

		build.onLoad({filter: /./}, async args => {
			// Load the file from the file system
			const source = await fs.promises.readFile(args.path, 'utf8');
			const filename = path.relative(process.cwd(), args.path);

			// Convert babel syntax to JavaScript
			try {
				const js = await babel.transformAsync(source, {
                    presets: ['@babel/preset-env'],
                    filename
                });
				const contents = js.code;
				return {contents};
			} catch (e) {
				return {errors: [e]};
			}
		});
	},
};

/**
 * Creates a bundle using `esbuild` using the index.js file located within `location` as the entrypoint of the bundle.
 *
 * @param {String} location The path where the index.js resides within.
 * @returns {Promise<String>} The bundled JavaScript as a string
 */
async function bundleJavascriptEsbuildPlugin(location) {
	const bundle = await esbuild.build({
		sourcemap: false,
		format: 'iife',
		target: 'es2020',
		minify: true,
		bundle: true,
		write: false,
		splitting: false,
		platform: 'browser',
		define: {
			'process.env.NODE_ENV': 'production',
		},
        entryPoints: [path.join(location, 'index.js')],
        plugins: [babelPlugin],
	});

	const bundleString = Buffer.from(bundle.outputFiles[0].contents).toString(
		'utf-8'
	);

	// return bundleString;

    const finalBundle = await esbuild.build({
		sourcemap: false,
		format: 'iife',
		target: 'es5',
		minify: true,
		bundle: true,
		write: false,
		splitting: false,
		platform: 'browser',
		define: {
			'process.env.NODE_ENV': 'production',
		},
        stdin: {
            contents: bundleString
        }
	});

	return Buffer.from(finalBundle.outputFiles[0].contents).toString(
		'utf-8'
    );
}

module.exports = {
	bundleJavascriptEsbuildPlugin,
};
