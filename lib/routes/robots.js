'use strict';

module.exports = function(app) {
	// Install routes
	app.get([
		'/robots.txt',
		'/__origami/service/build/robots.txt',
	 ], serveRobotsTxt);

	// Handlers
	function serveRobotsTxt(req, res) {
		res.set('Content-Type', 'text/plain;charset=UTF-8');
		res.end('User-Agent: *\nDisallow: /\n');
	}

};
