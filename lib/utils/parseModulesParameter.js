'use strict';

module.exports = parseModulesParameter;

/**
 * Turns 'o-colors,o-grid@^4,o-techdocs@*,o-buttons@latest'
 * into [['o-colors', ''], ['o-grid', '^4'], ['o-techdocs', '*'], ['o-buttons', 'latest']]
 */
function parseModulesParameter(modulesParameter) {
	return modulesParameter.split(',').map(module => {
		const [name, version] = module.split('@');
		return [
			name.trim(),
			version ? version.trim() : ''
		];
	});
}
