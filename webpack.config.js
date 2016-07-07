const webpack = require('webpack')
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
const path = require('path')

const libraryName = 'ZetaPush'

const plugins = [new UglifyJsPlugin({
  minimize: true
})]

const outputFile = `${libraryName.toLowerCase()}.min.js`

module.exports = {
  entry: ['whatwg-fetch', __dirname + '/lib/index.js'],
  devtool: 'source-map',
  output: {
    path: __dirname + '/dist',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    root: path.resolve('./lib'),
    extensions: ['', '.js']
  },
  plugins: plugins
}
