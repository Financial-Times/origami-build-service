'use strict';

const uniqueid = require('./uniqueid');

const getCacheKeyForParameters = (options = {}) => {
    return ['exportName', 'callback']
        .map(parameter => {
            const value = options[parameter];
            return typeof value === 'string' ? uniqueid(value, 64) : `no${parameter.toLowerCase()}`;
        })
        .join('.');
};

module.exports = {
    getCacheKeyForParameters
};
