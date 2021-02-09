'use strict';

const proclaim = require('proclaim');
const parseBuildServiceUrl = require('../../../../lib/url-builder/parse-build-service-url');
const UserError = require('../../../../lib/utils/usererror');

describe('lib/parse-build-service-url', () => {
    describe('given a url with unexpected special characters', () => {
        it('throws a user error', () => {
            proclaim.throws(() => {
                parseBuildServiceUrl(
                    'https://www.ft.com/__origami/service/build/v2/bundles/css?modules=<script></script>'
                );
            }, UserError);
        });
    });
    describe('given an invalid url', () => {
        it('throws a user error', () => {
            proclaim.throws(() => {
                parseBuildServiceUrl(
                    '_lol://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-test-component'
                );
            }, UserError);
        });
    });
    describe('given an empty string', () => {
        it('throws a user error', () => {
            proclaim.throws(() => {
                parseBuildServiceUrl(
                    ''
                );
            }, UserError);
        });
    });
    describe('given a Build Service URL for an endpoint that isn\'t "bundles"', () => {
        it('throws a user error', () => {
            proclaim.throws(() => {
                parseBuildServiceUrl(
                    'https://www.ft.com/__origami/service/build/v2/files/o-fonts-assets@1.5.0/MetricWeb-Regular.woff2'
                );
            }, UserError);
        });
    });
    describe('given a valid Build Service "bundles" URL', () => {
        it('returns a URL instance', () => {
            const url = parseBuildServiceUrl('https://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-test-component');
            proclaim.isInstanceOf(url, URL);
        });
    });
});
