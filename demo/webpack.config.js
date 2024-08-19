const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        gettingStarted: './demo/gettingStarted.ts',
        components: './demo/components.ts',
        servicesAndDependencies: './demo/servicesAndDependencies.ts',
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
                
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'public'),
    },
};
