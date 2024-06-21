'use strict';

const sinon = require('sinon');

const sanitizeErrors = module.exports = sinon.stub();
const mockMiddleware = sanitizeErrors.mockMiddleware = sinon.spy();
sanitizeErrors.returns(mockMiddleware);
