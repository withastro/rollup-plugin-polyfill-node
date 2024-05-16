/** @returns {import("rollup").RollupOptions} */
export default {
	input: 'lib/index.js',
	external: [
		'path',
		'crypto',
		'module',
		'@rollup/plugin-inject'
	],
	output: ['es','cjs'].map((format) => ({
		dir: `dist/${format==='es' ? 'es' : ''}`,
		exports: 'auto',
		format,
		generatedCode: {
			constBindings: true
		},
		preserveModules: true,
	})),
};
