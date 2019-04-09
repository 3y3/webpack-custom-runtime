'use strict';

const cct = require('./utils/custom-configurable-test');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

describe('ScriptAttr(Integrity)', function() {

    function cit(name, options, config) {
        cct(name, Object.assign({
            plugins: [
                new WebpackCustomRuntime({ behavior: '' }),
                new WebpackCustomRuntime.ScriptAttr.Integrity(options),
            ]
        }, config));
    }

    cit('should not to enable script integrity by default', {});
});
