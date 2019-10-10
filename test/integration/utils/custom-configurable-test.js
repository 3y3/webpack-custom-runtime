'use strict';

const webpack = require('./webpack');
const checkFsDiff = require('./check-fs-diff');
const WebpackCustomRuntime = require('../../../').CustomRuntimePlugin;

const defaultBase = webpack({
    plugins: [
        new WebpackCustomRuntime({ behavior: '' }),
    ]
});

module.exports = function cit(name, currConfig, base = defaultBase) {
    test(name, async function() {
        const curr = webpack(currConfig);

        await Promise.all([ base.result, curr.result ]);

        checkFsDiff(base, curr);
    });
};

module.exports.base = function(config) {
    return webpack(config);
};
