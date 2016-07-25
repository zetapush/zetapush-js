const path = require('path')
const webpack = require('webpack')
const { UglifyJsPlugin } = webpack.optimize

const library = 'ZetaPush'

const plugins = [new UglifyJsPlugin({
  minimize: true
})]

const filename = `${library.toLowerCase()}.min.js`

module.exports = {
  entry: ['whatwg-fetch', __dirname + '/lib/index.js'],
  devtool: 'source-map',
  output: {
    path: __dirname + '/dist',
    filename,
    library,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: ['babel', 'eslint'].map((loader) => ({
      test: /\.js$/,
      loader,
      exclude: /node_modules/
    }))
  },
  resolve: {
    root: path.resolve('./lib'),
    extensions: ['', '.js']
  },
  plugins
}
