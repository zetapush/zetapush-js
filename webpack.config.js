const path = require('path')
const webpack = require('webpack')
const { UglifyJsPlugin } = webpack.optimize

const library = 'ZetaPush'

const plugins = [new UglifyJsPlugin({
  minimize: true,
  compress: {
    warnings: false
  }
})]

const filename = `${library.toLowerCase()}.min.js`

module.exports = {
  entry: ['isomorphic-fetch', path.join(__dirname, 'lib/index.js')],
  devtool: 'source-map',
  externals: [
    {
      'isomorphic-fetch': {
        root: 'isomorphic-fetch',
        commonjs2: 'isomorphic-fetch',
        commonjs: 'isomorphic-fetch',
        amd: 'isomorphic-fetch'
      }
    }
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename,
    library,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }]
  },
  plugins
}
