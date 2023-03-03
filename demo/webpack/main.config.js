const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./common.config.js');

module.exports = merge(
    {
        entry: path.join(__dirname, '../src', 'index.js'),
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, '../dist'),
            publicPath: '/',
            clean: true,
        },
        devServer: {
            static: path.resolve(__dirname, '../dist'),
            port: 7000,
            allowedHosts: 'all',
            historyApiFallback: true,
            proxy: {
            }
        },
        devtool: 'inline-source-map',
        mode: 'development',
        plugins: [
            new HtmlWebpackPlugin({
                title: 'sustand demo',
                template: path.join(__dirname, '../views', 'index.html'),
            }),
        ],
    },
    common
);
