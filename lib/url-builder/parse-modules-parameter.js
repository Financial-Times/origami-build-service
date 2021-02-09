'use strict';

const UserError = require('../utils/usererror');

/**
 * Turns 'o-colors,o-grid@^4,o-techdocs@*,o-buttons@latest,@financial-times/o-test-component@v2.0.1'
 * into [['o-colors', ''], ['o-grid', '^4'], ['o-techdocs', '*'], ['o-buttons', 'latest'], ['@financial-times/o-test-component', 'v2.0.1']]
 * This supports "modules" and "components" parameters by name 'o-test-component' and by published package name
 * '@financial-times/o-test-component', so that both v2 and v3 Build Service urls may be parsed. It makes the pretty big
 * assumption that a component name is the same as its published package name, which is true but not currently enforced
 * by the specification.
 *
 * @param {URL} buildServiceUrl
 * @return {array} - an array of key/values, where the key is the component and value is the version requested e.g. [['o-colors', ''], ['o-grid', '^4']]
 * @throws {UserError} - Throws a user error if the build service url does not have a module parameter
 */
module.exports = function parseModulesParameter(buildServiceUrl) {
	const modulesParameter = buildServiceUrl.searchParams.get('modules');
	const componentsParameter = buildServiceUrl.searchParams.get('components');
	if (modulesParameter && componentsParameter) {
		throw new UserError(
			'Could not interpret your Build Service URL. It has both a ' +
			'"modules" and "components" parameters. It should have just one, ' +
			'depending on the version of the Build Service you are using.'
		);
	}
	const parameter = typeof modulesParameter === 'string' ? modulesParameter : componentsParameter;
	if (typeof parameter !== 'string') {
		throw new UserError(
			'Could not interpret your Build Service URL. It has no ' +
			'modules/components parameter.');
	}
	return parameter
		.split(',')
		.filter(module => Boolean(module))
		.map(module => {
			let name;
			let version;
			if (module.startsWith('@')) {
				const withoutAt = module.split('@');
				name = '@' + withoutAt[1];
				version = withoutAt[2];
			} else {
				[name, version] = module.split('@');
			}
			return [
				name.trim(),
				version ? version.trim() : ''
			];
		});
};
