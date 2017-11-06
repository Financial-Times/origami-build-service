'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');

const cachableParameters = ['exportName', 'callback'];

describe('lib/utils/cacheKey', function() {
    const defaultParameters = {
        exportName: 'someName',
        callback: 'applicationCallback'
    };
    let uniqueid;
    let cacheKey;

    beforeEach(function() {
		uniqueid = require('../../mock/uniqueid.mock');
        mockery.registerMock('./uniqueid', uniqueid);
        cacheKey = require('../../../../lib/utils/cacheKey');
    });

    describe('get cache key for paramters', function() {

        it('should return a string of the correct format', function() {
            const result = cacheKey.getCacheKeyForParameters({}).split('.');

            assert.lengthOf(result, Object.keys(defaultParameters).length);
        });

        cachableParameters.forEach((parameter) => {
            it(`should return the default cache key if ${parameter} is undefined`, function() {
                const parameters = Object.assign({}, defaultParameters, {
                    [parameter]: undefined
                });

                const result = cacheKey.getCacheKeyForParameters(parameters);

                assert.include(result, `no${parameter.toLowerCase()}`);
            });

            it(`should return the default cache key if ${parameter} is not a string`, function() {
                const parameters = Object.assign({}, defaultParameters, {
                    [parameter]: 123,
                });

                const result = cacheKey
                    .getCacheKeyForParameters(parameters)
                    .split('.');

                assert.include(result, `no${parameter.toLowerCase()}`);
            });

            it('should return the uniqueId of the parameter if it is defined', function() {
                const givenValue = 'stringParam';
                const parameters = Object.assign({}, defaultParameters, {
                    [parameter]: givenValue,
                });

                cacheKey.getCacheKeyForParameters(parameters).split('.');

                assert.isTrue(uniqueid.calledWith(givenValue));
            });

            it('should output the result of the uniqueId call', function() {
                const givenValue = 'stringParam';
                const dummyUniqueId = 'hash';
                const parameters = Object.assign({}, defaultParameters, {
                    [parameter]: givenValue,
                });
                uniqueid.withArgs(givenValue).returns(dummyUniqueId);

                const result = cacheKey
                    .getCacheKeyForParameters(parameters)
                    .split('.');

                assert.include(result, dummyUniqueId);
            });
        });
    });
});
