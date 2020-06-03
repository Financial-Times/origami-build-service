'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/cleanBrandParameter', () => {
    let httpError;
    let origamiService;
    let cleanBrandParameter;

    beforeEach(() => {
        origamiService = require('../../mock/origami-service.mock');

        httpError = require('../../mock/http-errors.mock');
        mockery.registerMock('http-errors', httpError);

        cleanBrandParameter = require('../../../../lib/middleware/cleanBrandParameter');
    });

    it('exports a function', () => {
        assert.isFunction(cleanBrandParameter);
    });

    describe('cleanBrandParameter()', () => {
        let middleware;

        beforeEach(() => {
            middleware = cleanBrandParameter();
        });

        it('returns a middleware function', () => {
            assert.isFunction(middleware);
        });

        describe('middleware(request, response, spyNext)', () => {
            const spyNext = sinon.spy();

            afterEach(() => {
                spyNext.reset();
                httpError.reset();
            });

            [
                'intttternal',
                '-invalid1',
                'inv@lid2',
                'inva.lid3',
            ].forEach((value) => {
                describe(`when the 'brand' query string is invalid, containing the value '${value}'`, () => {

                    beforeEach(() => {
                        origamiService.mockRequest.query.brand = value;
                        middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
                    });

                    it('creates a 400 HTTP error', () => {
                        assert.calledOnce(httpError);
                        assert.calledWithExactly(httpError, 400, 'The brand parameter must be one of: master, internal, whitelabel.');
                    });

                    it('calls `next` with the created error', () => {
                        assert.calledOnce(spyNext);
                        assert.calledWithExactly(spyNext, httpError.mockError);
                    });
                });
            });

            describe('when the `brand` query parameter is missing', () => {

                beforeEach(() => {
                    delete origamiService.mockRequest.query.brand;
                    middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
                });

                it('calls `next`', () => {
                    assert.calledOnce(spyNext);
                    assert.calledWithExactly(spyNext);
                });

                it('sets request.query.brand to "master"', () => {
                    assert.equal(origamiService.mockRequest.query.brand, 'master');
                });
            });

            describe('when the `brand` query parameter is valid', () => {

                const testBrandName = 'internal';

                beforeEach(() => {
                    origamiService.mockRequest.query.brand = testBrandName;
                    middleware(origamiService.mockRequest, origamiService.mockResponse, spyNext);
                });

                it('calls `next`', () => {
                    assert.calledOnce(spyNext);
                    assert.calledWithExactly(spyNext);
                });

                it('does not modify request.query.brand', () => {
                    assert.strictEqual(origamiService.mockRequest.query.brand, testBrandName);
                });
            });

        });

    });

});
