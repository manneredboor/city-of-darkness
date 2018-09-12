const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const mode = process.env.NODE_ENV || 'production'
const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  mode,
  entry: {
    editor: './src/entries/editor',
    main: './src/entries/main',
    spinner: './src/entries/spinner',
  },
  devtool: isDev ? 'eval-source-map' : false,

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: ['src', 'node_modules'],
  },

  output: {
    filename: isDev ? 'js/[name].js' : 'js/[name].[hash:6].js',
    path: path.resolve(__dirname, './dist'),
  },

  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          mangle: {
            safari10: true,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },

  plugins: [
    new CopyWebpackPlugin([{ from: './static', to: './' }]),
    new MiniCssExtractPlugin({
      filename: isDev ? 'css/[name].css' : 'css/[name].[hash:6].css',
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
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [require('autoprefixer')],
            },
          },
        ],
      },
    ],
  },
}
