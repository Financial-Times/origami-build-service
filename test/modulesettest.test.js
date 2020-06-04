'use strict';

const assert = require('chai').assert;
const URL = require('url');
const testhelper = require('./testhelper');
const ModuleSet = testhelper.ModuleSet;

describe('ModuleSet', function() {

	describe('#constructor(fullModuleNames)', function() {
		it('should create a moduleset from a url', function() {
			const url = URL.parse('/v1/bundles/js?modules=foo:/path,bar@1.2.3:/path/to/file.css,+baz@3+,meh@*,kinda@~2.1,http://example.com/package.tar.gz,user@github.com:components/jquery.git', true);
			const moduleset = new ModuleSet(url.query.modules.split(/\s*,\s*/));
			const info = moduleset.getResolvedModules();
			const endpoints = info.map(function(moduleInfo) {
				return moduleInfo.endpointString;
			});

			// foo=foo name overrides any potentially incorrect names in bower.json
			assert.deepEqual([
				'foo=foo', 'bar=bar#1.2.3', 'baz=baz#3',
				'meh=meh', 'kinda=kinda#~2.1',
				'package=http://example.com/package.tar.gz',
				'jquery=user@github.com:components/jquery.git'
			], endpoints);
		});

		it('should create a moduleset when the name is a remote module', function() {
			const moduleset = new ModuleSet(['o-colors@~v0']);
			const modules = moduleset.getResolvedModules();
			assert.equal(modules[0].endpoint.name, 'o-colors');
			assert.equal(modules[0].moduleName, 'o-colors');
			assert.equal(modules[0].fullModuleName, 'o-colors@~v0');
		});

		it('should create a moduleset when the name includes a branch identifier', function() {
			const moduleset = new ModuleSet(['o-colors@master']);
			const modules = moduleset.getResolvedModules();
			assert.equal(modules[0].endpoint.name, 'o-colors');
			assert.equal(modules[0].endpoint.target, 'master');
			assert.equal(modules[0].moduleName, 'o-colors');
			assert.equal(modules[0].fullModuleName, 'o-colors@master');
		});

		it('should create a moduleset when given a path as  the module name', function() {
			const moduleset = new ModuleSet(['./local-path@*']);
			const modules = moduleset.getResolvedModules();

			assert.equal(modules[0].endpoint.name, 'local-path');
			assert.equal(modules[0].moduleName, 'local-path');
			assert.equal(modules[0].fullModuleName, 'local-path@*');
		});

		it('should create a moduleset when given a main path override and no specific version identifier', function() {
			const moduleset = new ModuleSet(['o-errors:/demos/declarative.html']);
			const modules = moduleset.getResolvedModules();

			assert.equal(modules[0].endpoint.name, 'o-errors');
			assert.equal(modules[0].moduleName, 'o-errors');
			assert.equal(modules[0].fullModuleName, 'o-errors:/demos/declarative.html');
			assert.equal(modules[0].endpoint.target, '*');
		});

		it('should ignore empty strings in the input array', function() {
			const moduleset = new ModuleSet(['o-errors', '']);
			const modules = moduleset.getResolvedModules();

			assert.equal(modules.length, 1);
			assert.equal(modules[0].endpoint.name, 'o-errors');
			assert.equal(modules[0].moduleName, 'o-errors');
			assert.equal(modules[0].fullModuleName, 'o-errors');
			assert.equal(modules[0].endpoint.target, '*');
		});
	});

	describe('#getIdentifier()', function() {
		it('should return the same identifier for identical modulesets, regardless of the order', function() {
			const moduleSetA = new ModuleSet(['foo', 'bar']);
			const moduleSetB = new ModuleSet(['bar', 'foo']);

			assert.equal(moduleSetA.getIdentifier(), moduleSetB.getIdentifier());
		});

		it('should return the same identifier for identical modulesets, regardless of the main path override', function() {
			const moduleSetA = new ModuleSet(['foo:/main.js']);
			const moduleSetB = new ModuleSet(['foo:/main.css']);

			assert.equal(moduleSetA.getIdentifier(), moduleSetB.getIdentifier());
		});
	});

	describe('#getMainPathOverridesIdentifier()', function() {
		it('should not be the same as modules without a main path override', function() {
			const plain = new ModuleSet(['foo']).getMainPathOverridesIdentifier();
			const withPath = new ModuleSet(['foo:/path.scss']).getMainPathOverridesIdentifier();

			assert.notEqual(plain, withPath);
		});
		it('should return a sorted identifier with main path overrides', function() {
			const moduleSet = new ModuleSet(['foo:/main.abc', 'bar:/main.abc']);
			assert.equal(moduleSet.getMainPathOverridesIdentifier(), 'bar__main.abc;foo__main.abc6lFYD+lwEKPqGLdgwQ3yOfL8');
		});
	});

	describe('.parseModuleName(moduleName)', function() {
		it('should convert \'module@version\' strings to Bower endpoints', function() {
			const result = ModuleSet.parseModuleName('module@2.0.1');

			assert.equal(result.fullModuleName, 'module@2.0.1');
			assert.equal(result.moduleName, 'module');
			assert.deepEqual(result.endpoint, { name: 'module', source: 'module', target: '2.0.1' });
			assert.equal(result.endpointString, 'module=module#2.0.1');
		});

		it('should convert \'module@semverversion\' strings to Bower endpoints', function() {
			const result = ModuleSet.parseModuleName('module@^2.0.0');

			assert.equal(result.fullModuleName, 'module@^2.0.0');
			assert.equal(result.moduleName, 'module');
			assert.deepEqual(result.endpoint, { name: 'module', source: 'module', target: '^2.0.0' });
			assert.equal(result.endpointString, 'module=module#^2.0.0');
		});

		it('should parse a \'main\' path override from the module name', function() {
			const result = ModuleSet.parseModuleName('module@1.0.0:/main.css');

			assert.equal(result.fullModuleName, 'module@1.0.0:/main.css');
			assert.equal(result.moduleName, 'module');
			assert.deepEqual(result.endpoint, { name: 'module', source: 'module', target: '1.0.0' });
			assert.equal(result.endpointString, 'module=module#1.0.0');
			assert.equal(result.mainPathOverride, '/main.css');
		});

		it('should parse git URLs containng \'@\' and \':\' characters correctly', function() {
			const result = ModuleSet.parseModuleName('git://user@github.com:test/test.git@1.0.0:/main.css');

			assert.equal(result.fullModuleName, 'git://user@github.com:test/test.git@1.0.0:/main.css');
			assert.equal(result.moduleName, 'git://user@github.com:test/test.git');
			assert.deepEqual(result.endpoint, { name: 'test', source: 'git://user@github.com:test/test.git', target: '1.0.0' });
			assert.equal(result.endpointString, 'test=git://user@github.com:test/test.git#1.0.0');
			assert.equal(result.mainPathOverride, '/main.css');
		});
	});
});


describe('ModuleSet', function(){

	it('main-path', function(){
		const moduleset = new ModuleSet([
			'./local-path@*:/path_to_main',
			'./local-path:/path-to-main',
			'./local-path:not-main',
			'http://example.com/foo/bar:/main.css',
		]);
		moduleset.getIdentifier(); // ensure it doesn't re-sort
		const modules = moduleset.getResolvedModules();

		assert.equal(modules[0].endpoint.name, 'local-path');
		assert.equal(modules[0].moduleName, 'local-path');
		assert.equal(modules[0].mainPathOverride, '/path_to_main');

		assert.equal(modules[1].fullModuleName, 'local-path@*');
		assert.equal(modules[1].mainPathOverride, '/path-to-main');

		assert.equal(modules[2].endpoint.source, './local-path:not-main');
		assert.equal(modules[2].mainPathOverride, undefined);

		assert.equal(modules[3].moduleName, 'http://example.com/foo/bar');
		assert.equal(modules[3].endpoint.source, 'http://example.com/foo/bar');
		assert.equal(modules[3].mainPathOverride, '/main.css');
	});

	it('id', function(){
		const bundle1a = new ModuleSet(['o-colors', 'o-grid@*']);
		const bundle1b = new ModuleSet(['o-grid@*', 'o-colors']);
		const bundle2 = new ModuleSet(['o-colors', 'foo/o-grid@*']);
		const bundle3 = new ModuleSet(['o-colors;foo/o-grid@*']);

		assert.equal(bundle1a.getIdentifier(), bundle1b.getIdentifier());
		assert.notEqual(bundle2.getIdentifier(), bundle1b.getIdentifier());
		assert.notEqual(bundle2.getIdentifier(), bundle3.getIdentifier());
		assert.notInclude(bundle2.getIdentifier(), '/');
		assert.notInclude(bundle3.getIdentifier(), '/');
	});

	it('long-id', function(){
		const longPackageList = new Array(100).join('x').split('x').map(function(v,i){return 'package'+i;});
		const bundle3 = new ModuleSet(longPackageList);
		longPackageList.pop();
		const bundle4 = new ModuleSet(longPackageList);
		assert(bundle3.getIdentifier().length <= 64);
		assert(bundle3.getIdentifier().length > 24);
		assert(bundle4.getIdentifier().length <= 64);
		assert.notEqual(bundle3.getIdentifier(), bundle4.getIdentifier());
	});

	it('concatenate', function() {
		const bundleA = new ModuleSet(['o-colors', 'o-grid@*']);
		const bundleB = new ModuleSet(['o-gallery', 'o-fonts']);
		const expectedConcatenatedBundle = new ModuleSet(['o-colors', 'o-grid@*', 'o-gallery', 'o-fonts']);

		const bundleC = bundleA.concatenate(bundleB);

		assert.equal(bundleC.getIdentifier(), expectedConcatenatedBundle.getIdentifier());
	});
});
