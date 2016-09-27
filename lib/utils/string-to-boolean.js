'use strict';

const falsyValues = [
	'0',
	'false',
	'no',
	'none'
];

function stringToBoolean(string) {
	if (falsyValues.indexOf(string.trim()) >= 0) {
		return false;
	}
	return Boolean(string);
}

module.exports = stringToBoolean;
