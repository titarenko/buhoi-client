module.exports = {
	entry: './lib/index.js',
	output: {
		path: `${__dirname}/dist`,
		filename: 'bundle.js',
		libraryTarget: 'commonjs2',
	},
	externals: {
		inferno: { commonjs2: 'inferno' },
		redux: { commonjs2: 'redux' },
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						plugins: ['transform-runtime'],
						presets: ['stage-0', 'es2015', 'es2017'],
					},
				},
			},
		],
	},
	devtool: 'source-map',
}