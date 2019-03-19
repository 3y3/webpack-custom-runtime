const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const MemoryFileSystem = require('memory-fs');

const mainInputDir = path.join(__dirname, '..', 'fixtures');
const mainOutputDir = path.join(__dirname, '..', 'fixtures', 'dist');

module.exports = function(extend) {
    const config = webpackMerge({
        mode: 'development',
        devtool: false,
        entry: {
            'main-module': mainInputDir + '/main-module',
            'other-module': mainInputDir + '/other-module'
        },
        output: {
            path: mainOutputDir,
            filename: '[name].js',
        },
        optimization: {
            runtimeChunk: {
                name: 'runtime'
            }
        },
        plugins: [],
    }, extend);

    const fs = new MemoryFileSystem();

    const result = new Promise((resolve, reject) => {
        const compiler = webpack(config);

        compiler.outputFileSystem = fs;
        compiler.run((err, stats) => {
            if (err) {
                return reject(err);
            }
            return resolve(stats);
        });
    });

    return { fs, result };
};
