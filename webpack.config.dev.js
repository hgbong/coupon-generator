import webpack from 'webpack';
import path from 'path';

export default {
  devtool: 'inline-source-map',

  entry: [
    path.resolve(__dirname, 'src/client/index.js')
  ],
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'src/resources'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loaders: ['babel-loader'] },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  }
};
