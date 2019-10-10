'use strict';

const cct = require('./utils/custom-configurable-test');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

describe('RetryOnError', function() {

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
    ]);

    cit('should be disabled on `enabled: false`', [
        new WebpackCustomRuntime.ErrorHandler.RetryOnError({
            enabled: false
        })
    ]);

    cit('should configure waitOnline', [
        new WebpackCustomRuntime.ErrorHandler.RetryOnError({
            waitOnline: true
        })
    ]);

    describe('should configure namespace', function() {

        const base = cct.base({
            plugins: [
                new WebpackCustomRuntime({ behavior: '' }),
                new WebpackCustomRuntime.ErrorHandler.RetryOnError()
            ]
        });

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
