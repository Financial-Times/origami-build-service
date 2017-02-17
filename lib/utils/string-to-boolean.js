'use strict';

const falsyValues = [
	'0',
	'false',
	'no',
	'none'
];

function stringToBoolean(string) {
	if (falsyValues.includes(string.trim().toLowerCase())) {
		return false;
	}
	return Boolean(string);
}

module.exports = stringToBoolean;
