'use strict';

const path = require('path');
const { JSONParseIfExists } = require('./JSONParseIfExists');

async function getOrigamiJson(cwd) {
	// eslint-disable-next-line new-cap
	return JSONParseIfExists(path.join(cwd, '/origami.json'));
}

module.exports = {
    getOrigamiJson
};
