'use strict';

const cct = require('./utils/custom-configurable-test');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

describe('ScriptAttr(Timeout)', function() {

    function cit(name, options, config) {
        cct(name, Object.assign({
            plugins: [
                new WebpackCustomRuntime({ behavior: '' }),
                new WebpackCustomRuntime.ScriptAttr.Timeout(options),
            ]
        }, config));
    }

    cit('should not to override script timeout by default', {});

    cit('should override script timeout from options', { value: 50 });

    cit('should override script type from config', {}, {
        output: {
            chunkLoadTimeout: 60000
        }
    });
});
