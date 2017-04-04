'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const logHostname = module.exports = sinon.stub();
const mockMiddleware = logHostname.mockMiddleware = sinon.spy();
logHostname.returns(mockMiddleware);
