const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');
const nodeExternals = require('webpack-node-externals');

const plugins = [];

const startServerPlugin = new WebpackShellPlugin({
    onBuildEnd: [
        './run.sh'
    ]
});

if (-1 !== process.argv.indexOf('--watch')) {
    plugins.push(startServerPlugin);
}

module.exports = {
    entry: {
        main: path.resolve(__dirname, 'src/main.ts'),
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/')
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        symlinks: false,
    },
    target: 'node',
    mode: 'development',
    devtool: 'cheap-eval-source-map',
    optimization: {
        minimize: false
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    plugins: plugins,
    externals: [
        nodeExternals({
            whitelist: [
                '@glut/admin-core',
            ]
        }),
        {
            winston: 'winston',
        }
    ],
    module: {
        rules: [{
            test: /\.ts$/,
            loader: 'awesome-typescript-loader',
            options: {
                allowTsInNodeModules: true,
            },
        }]
    }
};
