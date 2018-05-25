const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const Visualizer = require('webpack-visualizer-plugin');
const FileListPlugin = require('./FileListPlugin.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    resolve: {
        extensions: ['.js', '.css', '.json'],
    },
    mode: 'production',
    entry: {
        index: path.resolve(__dirname, 'src/index.js'),
    },
    plugins: [
        new FileListPlugin(),
        new Visualizer({
            filename: './statistics.html',
        }),
        new webpack.DefinePlugin({
            REQUEST_API: JSON.stringify('official'),
        }),
        new ExtractTextPlugin({
            filename: '[name].css',
            allChunks: false,
        }),
        new HtmlWebpackPlugin({
            title: 'myapp',
            template: path.resolve(__dirname, 'src/index.ejs'),
            inject: true,
            hash: false,
        }),
        new CleanWebpackPlugin(['dist']),
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[chunkhash].entry.bundle.js',
        chunkFilename: '[name].[chunkhash].chunk.bundle.js',
        publicPath: '/dist/',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: ['babel-loader', 'eslint-loader'],
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: true,
                                modules: true,
                                localIdentName:
                                    '[name]---[local]---[hash:base64:5]',
                                camelCase: true,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: () => [
                                    require('postcss-flexbugs-fixes'),
                                    autoprefixer({
                                        browsers: [
                                            '>1%',
                                            'last 4 versions',
                                            'Firefox ESR',
                                            'not ie < 9', // React doesn't support IE8 anyway
                                        ],
                                        flexbox: 'no-2009',
                                    }),
                                ],
                            },
                        },
                    ],
                }),
            },
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 1024,
                        name: '[name].[hash:8].[ext]',
                    },
                },
            },
        ],
    },
    optimization: {
        minimize: true,
        runtimeChunk: {
            name: 'manifest',
        },
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'initial',
                    minSize: 1,
                },
            },
        },
    },
};
