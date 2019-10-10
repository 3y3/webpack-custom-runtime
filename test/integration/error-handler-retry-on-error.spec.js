'use strict';

const cct = require('./utils/custom-configurable-test');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

describe('RetryOnError', function() {

    const base = cct.base({
        plugins: [
            new WebpackCustomRuntime({ behavior: '' }),
            new WebpackCustomRuntime.ErrorHandler.RetryOnError()
        ]
    });

    function cit(name, plugins = [], base) {
        cct(name, {
            plugins: [
                new WebpackCustomRuntime({ behavior: '' }),
                ...plugins
            ]
        }, base);
    }

    cit('should setup default retry', [
        new WebpackCustomRuntime.ErrorHandler.RetryOnError()
    ]);

    cit('should configure retry', [
        new WebpackCustomRuntime.ErrorHandler.RetryOnError({
            maxRetryCount: 2
        })
    ], base);

    cit('should configure waitOnline', [
        new WebpackCustomRuntime.ErrorHandler.RetryOnError({
            waitOnline: true
        })
    ], base);

    cit('should be disabled on `enabled: false`', [
        new WebpackCustomRuntime.ErrorHandler.RetryOnError({
            enabled: false
        })
    ]);

    describe('should configure namespace', function() {

        cit('top level case', [
            new WebpackCustomRuntime.ErrorHandler.RetryOnError({
                namespace: '__NS__'
            })
        ], base);

        cit('brackets case', [
            new WebpackCustomRuntime.ErrorHandler.RetryOnError({
                namespace: 'window["__NS__"]'
            })
        ], base);

        cit('dot case', [
            new WebpackCustomRuntime.ErrorHandler.RetryOnError({
                namespace: 'Ya.__NS__'
            })
        ], base);

        cit('requireFn case', [
            new WebpackCustomRuntime.ErrorHandler.RetryOnError({
                namespace: '{requireFn}.__NS__'
            })
        ], base);
    });
});
