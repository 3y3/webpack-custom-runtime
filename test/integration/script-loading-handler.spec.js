'use strict';

const cct = require('./utils/custom-configurable-test');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

class TestPlainLoadingHandler extends WebpackCustomRuntime.LoadingHandler {

    codeResolver(options, chunk, hash, { result }) {
        return `console.log(${result});`;
    }
}

class TestFuncLoadingHandler extends WebpackCustomRuntime.LoadingHandler {

    codeResolver() {
        return function(p1, p2, p3) {
            console.log(p3);
        }
    }
}

describe('scriptLoadingHandler', function() {

    function cit(name, plugins = []) {
        cct(name, {
            plugins: [
                new WebpackCustomRuntime({ behavior: '' }),
                ...plugins
            ]
        });
    }

    cit('should apply custom plain loading handler', [
        new TestPlainLoadingHandler()
    ]);

    cit('should apply custom func loading handler', [
        new TestFuncLoadingHandler()
    ]);

    cit('should apply multy loading handlers', [
        new TestPlainLoadingHandler(),
        new TestFuncLoadingHandler()
    ]);
});
