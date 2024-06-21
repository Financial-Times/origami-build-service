'use strict';

const sinon = require('sinon');

const logHostname = module.exports = sinon.stub();
const mockMiddleware = logHostname.mockMiddleware = sinon.spy();
logHostname.returns(mockMiddleware);
