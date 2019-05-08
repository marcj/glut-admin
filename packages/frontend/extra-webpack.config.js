/*
 * Copyright (c) by Marc J. Schmidt <marc@marcjschmidt.de> - all rights reserved.
 */

// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    optimization: {
        minimizer: [new TerserPlugin({
            parallel: true,
            cache: true,
            terserOptions: {
                ecma: 7,
                warnings: false,
                parse: {},
                // compress: {
                // this breaks router in production with [routerLinks]="['/bla']"
                //     warnings: false,
                //     pure_getters: true,
                //     unsafe: true,
                //     unsafe_comps: true
                // },
                mangle: false,
                module: false,
                output: null,
                toplevel: false,
                nameCache: null,
                ie8: false,
                keep_classnames: true,
                keep_fnames: true,
                safari10: false
            }
        })]
    }
};
