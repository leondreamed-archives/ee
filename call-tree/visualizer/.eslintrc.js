/* eslint-env node */

module.exports = {
	root: true,
	extends: ['../../.eslintrc.js'],
	parserOptions: {
		parser: '@typescript-eslint/parser',
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	settings: {
		'import/resolver': {
			alias: {
				map: [
					['~', '../..'],
					['~/generated/call-tree', './noop.ts'],
				],
				extensions: ['.js', '.ts'],
			},
		},
	},
};
