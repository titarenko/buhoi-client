const webpack = require('webpack')

module.exports = {
	entry: './index.js',
	output: {
		path: __dirname,
		filename: 'dist.js',
	},
	externals: {
		inferno: { commonjs: 'inferno' },
		redux: { commonjs: 'redux' },
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['stage-0', 'es2015'],
					},
				},
			},
		],
	},
}