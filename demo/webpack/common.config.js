const path = require('path');

module.exports = {
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            [
                                '@babel/preset-react',
                                {
                                    runtime: 'automatic',
                                },
                            ],
                        ],
                    },
                },
            },
        ],
    },
    resolve: {
        fallback: {
            path: require.resolve('path-browserify')
        },
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
        alias: {
            sustand: path.resolve(__dirname, '../../src/')
        }
    },
};
