'use strict';

const cct = require('./utils/custom-configurable-test');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

class TestPlainErrorHandler extends WebpackCustomRuntime.ErrorHandler {

    codeResolver(options, chunk, hash, { originalError, result }) {
        return `console.log(${originalError}, ${result});`;
    }
}

class TestFuncErrorHandler extends WebpackCustomRuntime.ErrorHandler {

    codeResolver() {
        return function(p1, p2, p3, p4) {
            console.log(p3, p4);
        }
    }
}

describe('scriptErrorHandler', function() {

    function cit(name, plugins = []) {
        cct(name, {
            plugins: [
                new WebpackCustomRuntime({ behavior: '' }),
                ...plugins
            ]
        });
    }

    cit('should reject original error, if there is no strategies');

    cit('should apply custom plain error handler', [
        new TestPlainErrorHandler()
    ]);

    cit('should apply custom func error handler', [
        new TestFuncErrorHandler()
    ]);

    cit('should apply multy error handlers', [
        new TestPlainErrorHandler(),
        new TestFuncErrorHandler()
    ]);
});
