const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const mode = process.env.NODE_ENV || 'production'

module.exports = {
  mode,
  entry: {
    main: './src/entries/main',
    editor: './src/entries/editor',
  },
  devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : false,

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: ['src', 'node_modules'],
  },

  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, './dist'),
  },

  optimization: {
    minimizer: [new OptimizeCSSAssetsPlugin({})],
  },

  plugins: [
    new CopyWebpackPlugin([{ from: './static', to: './' }]),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
      server: { baseDir: ['./dist'] },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
        query: {
          silent: true,
          useCache: true,
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
        ],
      },
    ],
  },
}
