'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const metrics = module.exports = sinon.stub();
const inc = sinon.stub();
metrics.counter = sinon.stub().returns({inc});
metrics.counter.inc = inc;
metrics.gauge = sinon.stub();
metrics.toJSON = sinon.stub();
