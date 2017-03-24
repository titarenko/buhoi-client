module.exports = {
	entry: './lib/index.js',
	output: {
		path: `${__dirname}/dist`,
		filename: 'bundle.js',
		libraryTarget: 'commonjs2',
	},
	externals: { inferno: { commonjs2: 'inferno' } },
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: { presets: ['stage-0', 'es2015'] },
				},
			},
		],
	},
}