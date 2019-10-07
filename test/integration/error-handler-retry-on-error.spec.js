'use strict';

const cct = require('./utils/custom-configurable-test');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

describe('RetryOnError', function() {

    function cit(name, plugins = []) {
        cct(name, {
            plugins: [
                new WebpackCustomRuntime({ behavior: '' }),
                ...plugins
            ]
        });
    }

    cit('should setup default retry', [
        new WebpackCustomRuntime.ErrorHandler.RetryOnError()
    ]);

    cit('should configure retry', [
        new WebpackCustomRuntime.ErrorHandler.RetryOnError({
            maxRetryCount: 2
        })
    ]);

    cit('should be disabled on `enabled: false`', [
        new WebpackCustomRuntime.ErrorHandler.RetryOnError({
            enabled: false
        })
    ]);
});
