
'use strict';

const proclaim = require('proclaim');
const parseModulesParameter = require('../../../../lib/url-updater/parse-modules-parameter');
const UserError = require('../../../../lib/utils/usererror');

describe('lib/parse-modules-parameter', () => {
    const baseUrl = 'https://www.ft.com/__origami/service/build/v2/bundles/css';

    describe('given a URL with a valid "modules" parameter', () => {
        describe('which includes modules of exact versions', () => {
            it('returns an array of module name / version entries', () => {
                const testURL = new URL(
                    `${baseUrl}?modules=o-layout@4.2.0,o-fonts@v4.4.0,o-example@2.0.0-beta.1`
                );
                const results = parseModulesParameter(testURL);
                proclaim.deepEqual(results, [
                    ['o-layout','4.2.0'],
                    ['o-fonts','v4.4.0'],
                    ['o-example','2.0.0-beta.1']
                ]);
            });
        });

        describe('which includes modules with a version range', () => {
            it('returns an array of module name / version entries', () => {
                const testURL = new URL(
                    `${baseUrl}?modules=o-layout@^4,o-fonts@*,o-example@>=1.0.30 <1.0.31`
                );
                const results = parseModulesParameter(testURL);
                proclaim.deepEqual(results, [
                    ['o-layout', '^4'],
                    ['o-fonts', '*'],
                    ['o-example', '>=1.0.30 <1.0.31']
                ]);
            });
        });

        describe('which includes modules with no specified version', () => {
            it('returns an array of module name / version entries', () => {
                const testURL = new URL(
                    `${baseUrl}?modules=o-layout,o-fonts,o-example`
                );
                const results = parseModulesParameter(testURL);
                proclaim.deepEqual(results, [
                    ['o-layout', ''],
                    ['o-fonts', ''],
                    ['o-example', '']
                ]);
            });
        });

        describe('which includes modules of various version ranges', () => {
            it('returns an array of module name / version entries', () => {
                const testURL = new URL(
                    `${baseUrl}?modules=o-layout@,o-fonts@2.0.0,o-example@>=1.0.30 <1.0.31`
                );
                const results = parseModulesParameter(testURL);
                proclaim.deepEqual(results, [
                    ['o-layout', ''],
                    ['o-fonts', '2.0.0'],
                    ['o-example', '>=1.0.30 <1.0.31']
                ]);
            });
        });

        describe('which includes modules with published scope in the name', () => {
            it('returns an array of module names including any scope / version entries', () => {
                const testURL = new URL(
                    `${baseUrl}?modules=@financial-times/o-layout@,@financial-times/o-fonts@2.0.0,@financial-times/o-example@>=1.0.30 <1.0.31`
                );
                const results = parseModulesParameter(testURL);
                proclaim.deepEqual(results, [
                    ['@financial-times/o-layout', ''],
                    ['@financial-times/o-fonts', '2.0.0'],
                    ['@financial-times/o-example', '>=1.0.30 <1.0.31']
                ]);
            });
        });

        describe('which includes a modules parameter but no modules', () => {
            it('returns an empty array', () => {
                const testURL = new URL(
                    `${baseUrl}?modules=`
                );
                const results = parseModulesParameter(testURL);
                proclaim.deepEqual(results, []);
            });
        });
    });

    describe('given a URL with a valid  "components" parameter instead of "modules"', () => {
        it('returns an array of module name / version entries', () => {
            const testURL = new URL(
                `${baseUrl}?components=@financial-times/o-layout@,o-fonts@2.0.0,o-example@>=1.0.30 <1.0.31`
            );
            const results = parseModulesParameter(testURL);
            proclaim.deepEqual(results, [
                ['@financial-times/o-layout', ''],
                ['o-fonts', '2.0.0'],
                ['o-example', '>=1.0.30 <1.0.31']
            ]);
        });
    });

    describe('given a URL with both a valid "components" and "modules" parameter', () => {
        it('throws a user error', () => {
            const testURL = new URL(
                `${baseUrl}?modules=o-example@1&components=o-example@2`
            );
            proclaim.throws(parseModulesParameter.bind(this, testURL), UserError);
        });
    });

    describe('given a URL with neither a "components" or "modules" parameter', () => {
        it('throws a user error', () => {
            const testURL = new URL(
                `${baseUrl}?nope-nothing-of-use-here`
            );
            proclaim.throws(parseModulesParameter.bind(this, testURL), UserError);
        });
    });
});
