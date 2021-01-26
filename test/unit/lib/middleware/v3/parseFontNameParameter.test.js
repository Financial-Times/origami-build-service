/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const UserError = require('../../../../../lib/utils/usererror');
const {
	parseFontNameParameter,
} = require('../../../../../lib/middleware/v3/parseFontNameParameter');

describe('parseFontNameParameter', () => {
	it('it is a function', async () => {
		proclaim.isFunction(parseFontNameParameter);
	});
	it('throws UserError if font_name parameter is an empty string', async () => {
		proclaim.throws(() => {
			parseFontNameParameter('');
		}, UserError);

		proclaim.throws(() => {
			parseFontNameParameter('');
		}, 'The font_name query parameter can not be an empty string.');
	});

	it('throws UserError if font_name parameter is not a string', async () => {
		proclaim.throws(() => {
			parseFontNameParameter(null);
		}, UserError);

		proclaim.throws(() => {
			parseFontNameParameter(null);
		}, 'The font_name query parameter must be a string.');

		proclaim.throws(() => {
			parseFontNameParameter([1,2]);
		}, UserError);

		proclaim.throws(() => {
			parseFontNameParameter([1,2]);
		}, 'The font_name query parameter must be a string.');

		proclaim.throws(() => {
			parseFontNameParameter(12);
		}, UserError);

		proclaim.throws(() => {
			parseFontNameParameter(12);
		}, 'The font_name query parameter must be a string.');

		proclaim.throws(() => {
			parseFontNameParameter(true);
		}, UserError);

		proclaim.throws(() => {
			parseFontNameParameter(true);
		}, 'The font_name query parameter must be a string.');
	});

	it('throws UserError if font_name parameter is not valid', async () => {
		proclaim.throws(() => {
			parseFontNameParameter('../');
		}, UserError);

		proclaim.throws(() => {
			parseFontNameParameter('../');
		}, 'The font_name query parameter value is not valid. It can not contain `/`, `<`, `>`, `:`, `"`, `\\`, `|`, `?`, `*`, or non-printable characters `\\x00-\\x1F`.');

		proclaim.throws(() => {
			parseFontNameParameter('..');
		}, UserError);

		proclaim.throws(() => {
			parseFontNameParameter('..');
		}, 'The font_name query parameter value is not valid. It can not contain `/`, `<`, `>`, `:`, `"`, `\\`, `|`, `?`, `*`, or non-printable characters `\\x00-\\x1F`.');

		proclaim.throws(() => {
			parseFontNameParameter('.');
		}, UserError);

		proclaim.throws(() => {
			parseFontNameParameter('.');
		}, 'The font_name query parameter value is not valid. It can not contain `/`, `<`, `>`, `:`, `"`, `\\`, `|`, `?`, `*`, or non-printable characters `\\x00-\\x1F`.');

		proclaim.throws(() => {
			parseFontNameParameter('./hello/../../secret-file.txt');
		}, UserError);

		proclaim.throws(() => {
			parseFontNameParameter('./hello/../../secret-file.txt');
		}, 'The font_name query parameter value is not valid. It can not contain `/`, `<`, `>`, `:`, `"`, `\\`, `|`, `?`, `*`, or non-printable characters `\\x00-\\x1F`.');

		proclaim.throws(() => {
			parseFontNameParameter('<');
		}, 'The font_name query parameter value is not valid. It can not contain `/`, `<`, `>`, `:`, `"`, `\\`, `|`, `?`, `*`, or non-printable characters `\\x00-\\x1F`.');
		proclaim.throws(() => {
			parseFontNameParameter('>');
		}, 'The font_name query parameter value is not valid. It can not contain `/`, `<`, `>`, `:`, `"`, `\\`, `|`, `?`, `*`, or non-printable characters `\\x00-\\x1F`.');
		proclaim.throws(() => {
			parseFontNameParameter(':');
		}, 'The font_name query parameter value is not valid. It can not contain `/`, `<`, `>`, `:`, `"`, `\\`, `|`, `?`, `*`, or non-printable characters `\\x00-\\x1F`.');
		proclaim.throws(() => {
			parseFontNameParameter('"');
		}, 'The font_name query parameter value is not valid. It can not contain `/`, `<`, `>`, `:`, `"`, `\\`, `|`, `?`, `*`, or non-printable characters `\\x00-\\x1F`.');
		proclaim.throws(() => {
			parseFontNameParameter('\\');
		}, 'The font_name query parameter value is not valid. It can not contain `/`, `<`, `>`, `:`, `"`, `\\`, `|`, `?`, `*`, or non-printable characters `\\x00-\\x1F`.');
		proclaim.throws(() => {
			parseFontNameParameter('|');
		}, 'The font_name query parameter value is not valid. It can not contain `/`, `<`, `>`, `:`, `"`, `\\`, `|`, `?`, `*`, or non-printable characters `\\x00-\\x1F`.');
		proclaim.throws(() => {
			parseFontNameParameter('?');
		}, 'The font_name query parameter value is not valid. It can not contain `/`, `<`, `>`, `:`, `"`, `\\`, `|`, `?`, `*`, or non-printable characters `\\x00-\\x1F`.');
		proclaim.throws(() => {
			parseFontNameParameter('*');
		}, 'The font_name query parameter value is not valid. It can not contain `/`, `<`, `>`, `:`, `"`, `\\`, `|`, `?`, `*`, or non-printable characters `\\x00-\\x1F`.');

		for (const char of ['\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07', '\x08', '\x09', '\x0A', '\x0B', '\x0C', '\x0D', '\x0E', '\x0F', '\x10', '\x11', '\x12', '\x13', '\x14', '\x15', '\x16', '\x17', '\x18', '\x19', '\x1A', '\x1B', '\x1C', '\x1D', '\x1E', '\x1F']) {
			proclaim.throws(() => {
				parseFontNameParameter(char);
			}, 'The font_name query parameter value is not valid. It can not contain `/`, `<`, `>`, `:`, `"`, `\\`, `|`, `?`, `*`, or non-printable characters `\\x00-\\x1F`.');
		}

	});

	it('returns font_name parameter if it is a valid value', async () => {
		proclaim.deepStrictEqual(
			parseFontNameParameter(
				'origami.json'
			),
			'origami.json'
		);
		proclaim.deepStrictEqual(
			parseFontNameParameter(
				'main.js'
			),
			'main.js'
		);
	});
});
