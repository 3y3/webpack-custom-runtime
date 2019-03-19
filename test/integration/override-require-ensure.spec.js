'use strict';

const webpack = require('./utils/webpack');
const checkFsDiff = require('./utils/check-fs-diff');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

const base = webpack();

describe('require-ensure override', function() {

    function cit(name, options, config) {
        test(name, async () => {
            const curr = webpack(Object.assign({
                plugins: [
                    new WebpackCustomRuntime(options)
                ]
            }, config));

            await Promise.all([ base.result, curr.result ]);

            checkFsDiff(base, curr);
        });
    }

    cit('should implement default webpack behavior', {}, {
        output: {
            jsonpScriptType: 'module',
            chunkLoadTimeout: 60000,
            crossOriginLoading: 'anonymous',
        }
    });

    cit('should skip defaults on custom behavior', { behavior: '' });
});
