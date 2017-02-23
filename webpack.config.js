const webpack = require('webpack')

module.exports = {
	entry: './modules/client.js',
	output: {
		path: __dirname,
		filename: 'dist.js',
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
						presets: ['stage-0', 'es2015'],
					},
				},
			},
		],
	},
}