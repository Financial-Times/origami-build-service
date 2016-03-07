'use strict';

function redirectWithBody(response, status, location, body) {
	response.status(status);
	response.location(location);
	response.send(body);
}

module.exports = redirectWithBody;
