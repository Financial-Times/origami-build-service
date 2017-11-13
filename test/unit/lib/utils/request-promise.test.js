'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');

describe('lib/request-promise', () => {
	let request;
	let requestPromise;

	beforeEach(() => {
		request = require('../../mock/request.mock');
		mockery.registerMock('request', request);

		requestPromise = require('../../../../lib/utils/request-promise');
	});

	it('exports a function', () => {
		assert.isFunction(requestPromise);
	});

	describe('requestPromise(options)', () => {
		let options;
		let response;
		let resolvedValue;

		beforeEach(() => {
			options = {
				uri: 'foo',
				method: 'POST'
			};
			response = {
				statusCode: 200
			};
			request.yieldsAsync(null, response);
			return requestPromise(options).then(value => {
				resolvedValue = value;
			});
		});

		it('requests the given URL', () => {
			assert.calledOnce(request);
			assert.calledWithMatch(request, options);
		});

		it('uses the options, with forever defaulted to true so http Keep-Alive is used', () => {
			assert.calledOnce(request);
			assert.calledWithMatch(request, Object.assign({forever: true}, options));
		});

		it('resolves with the response object', () => {
			assert.strictEqual(resolvedValue, response);
		});

		describe('when the request errors', () => {
			let rejectedError;
			let requestError;

			beforeEach(() => {
				requestError = new Error('mock error');
				request.yieldsAsync(requestError);
				return requestPromise(options).catch(error => {
					rejectedError = error;
				});
			});

			it('rejects with the request error', () => {
				assert.strictEqual(rejectedError, requestError);
			});

		});

	});

});
