const path = require('path')

// const CopyWebpackPlugin = require('copy-webpack-plugin')
// const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const PugPlugin = require('pug-plugin')
const CopyPlugin = require('copy-webpack-plugin')

// const mode = process.env.NODE_ENV || 'production'
// const isDev = process.env.NODE_ENV === 'development'

module.exports = {

  // entry: {
  //   editor: './src/entries/editor',
  //   main: './src/entries/main',
  //   spinner: './src/entries/spinner',
  // },

  // devtool: isDev ? 'eval-source-map' : false,

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },

  output: {
    // filename: isDev ? 'js/[name].js' : 'js/[name].[hash:6].js',
    path: path.resolve(__dirname, './dist'),
  },

  plugins: [
    new PugPlugin({
      hotUpdate: true,
      entry: 'src/views/',
      pretty: true,
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
    new CopyPlugin({
      patterns: [{ from: 'static', to: './' }],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(s?css|sass)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(ico|png|jpe?g|webp|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext][query]',
        },
      },
      {
        test: /\.([cm]?ts|tsx)$/,
        loader: 'ts-loader',
      },
    ],
  },

  devServer: {
    static: [path.join(__dirname, 'static')],
    watchFiles: path.join(__dirname, 'src'),
    port: 3000,
    hot: true,
    // liveReload: true,
  },
}
