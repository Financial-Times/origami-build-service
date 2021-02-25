/* eslint-disable new-cap */
'use strict';

const assert = require('chai').assert;

describe('lib/utils/parseModulesParameter', function() {
	let parseModulesParameter;

	beforeEach(function() {
		parseModulesParameter = require('../../../../lib/utils/parseModulesParameter');
	});

	it('should be a function', function() {
		assert.isFunction(parseModulesParameter);
	});

	describe('parseModulesParameter(modules)', function() {

        it('turns "o-colors,o-grid@^4,o-techdocs@*,o-buttons@latest" into a nested array where first items are the module name and second items are the version', function() {
            assert.deepEqual(parseModulesParameter('o-colors,o-grid@^4,o-techdocs@*,o-buttons@latest'),
            [['o-colors', ''], ['o-grid', '^4'], ['o-techdocs', '*'], ['o-buttons', 'latest']]);
        });
	});
});
