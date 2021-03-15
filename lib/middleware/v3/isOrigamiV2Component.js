'use strict';

const { getOrigamiJson } = require('../../utils/getOrigamiJson');

/**
 * Checks whether a specified location contains an Origami V2 Component.
 *
 * @param {String} location location to check if it contains an Origami V2 Component
 * @returns {Promise<boolean>} returns a Promise containing `true` if the location contains an Origami V2 Component, otherwise it returns a Promise containing `false`
 */
async function isOrigamiV2Component(location) {
	const origamiConfig = await getOrigamiJson(location);
	if (origamiConfig && typeof origamiConfig.origamiVersion === 'string' && origamiConfig.origamiVersion.startsWith('2.') {
		return true;
	} else {
		return false;
	}
}

module.exports = {
	isOrigamiV2Component,
};
