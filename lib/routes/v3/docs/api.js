'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const navigation = require('../../../../data/navigation.json');

module.exports = app => {
	app.get('/v3/docs/api', cacheControl({maxAge: '7d'}), (request, response) => {
		const path = request.path.split('?')[0];
		navigation.items.map(item => item.current = false);
		const item = navigation.items.find(item => {
			return path === '/'+item.href;
		});
		if (item) {
			item.current = true;
		}
		response.render('apiv3', {
			title: 'API Reference - Origami Build Service',
			layoutStyle: 'o-layout--docs',
			navigation
		});
	});

};
