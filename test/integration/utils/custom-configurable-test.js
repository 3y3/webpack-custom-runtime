'use strict';

const webpack = require('./webpack');
const checkFsDiff = require('./check-fs-diff');
const WebpackCustomRuntime = require('../../../').CustomRuntimePlugin;

const base = webpack({
    plugins: [
        new WebpackCustomRuntime({ behavior: '' }),
    ]
});

module.exports = function cit(name, currConfig) {
    test(name, async function() {
        const curr = webpack(currConfig);

        await Promise.all([ base.result, curr.result ]);

        checkFsDiff(base, curr);
    });
};
