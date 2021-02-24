'use strict';

const path = require('path');
const { requireIfExists } = require('./requireIfExists');

async function getOrigamiJson(cwd) {
	return requireIfExists(path.join(cwd, '/origami.json'));
}

module.exports = {
    getOrigamiJson
};
