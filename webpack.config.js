const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader'
      }
    }, {
      test: /\.css$/,
      use: ["css-loader"]
    }]
  },
  externals: {
    'react': 'commonjs react',
    'react-dom' : 'commonjs react-dom'
  },
  output: {
    library: "FloatingNodes",
    libraryTarget: "umd",
    filename: './dist/FloatingNodes.js'
  },
  plugins: [
    new UglifyJsPlugin()
  ]
}
