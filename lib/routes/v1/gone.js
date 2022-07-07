'use strict';

module.exports = function(app) {
	app.get([
		'/v1/modules/:module',
		'/__origami/service/build/v1/modules/:module',
		
		'/modules/:module',
		'/__origami/service/build/modules/:module',
	 ], () => {
		const gone = new Error('The modules endpoint no longer exists. There is no direct alternative. For support speak to the Origami team.');
		gone.status = 410;
		throw new Error(gone);
	 });

	app.get([
		/^\/v1\/bundles\/(css|js)/,
		/^\/__origami\/service\/build\/v1\/bundles\/(css|js)/,

		/^\/bundles\/(css|js)/,
		/^\/__origami\/service\/build\/bundles\/(css|js)/,
	 ], () => {
		const gone = new Error('The v1 bundles endpoint no longer exists. Migrate to Origami Build Service v3: https://www.ft.com/__origami/service/build/v3/docs/api');
		gone.status = 410;
		throw new Error(gone);
	 });
};
