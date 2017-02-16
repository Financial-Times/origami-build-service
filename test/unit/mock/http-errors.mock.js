'use strict';

const sinon = require('sinon');

const httpError = module.exports = sinon.stub();
const mockError = httpError.mockError = sinon.stub();

httpError.returns(mockError);
