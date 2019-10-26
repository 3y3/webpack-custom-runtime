'use strict';

const cct = require('./utils/custom-configurable-test');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

class TestPlainLoadHandler extends WebpackCustomRuntime.LoadHandler {

    codeResolver(options, chunk, hash, { result }) {
        return `console.log(${result});`;
    }
}

class TestFuncLoadHandler extends WebpackCustomRuntime.LoadHandler {

    codeResolver() {
        return function(p1, p2, p3) {
            console.log(p3);
        }
    }
}

describe('scriptLoadHandler', function() {

    function cit(name, plugins = []) {
        cct(name, {
            plugins: [
                new WebpackCustomRuntime({ behavior: '' }),
                ...plugins
            ]
        });
    }

    cit('should apply custom plain load handler', [
        new TestPlainLoadHandler()
    ]);

    cit('should apply custom func load handler', [
        new TestFuncLoadHandler()
    ]);

    cit('should apply multy load handlers', [
        new TestPlainLoadHandler(),
        new TestFuncLoadHandler()
    ]);
});
