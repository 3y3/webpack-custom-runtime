'use strict';

const cct = require('./utils/custom-configurable-test');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

describe('ScriptAttr(Type)', function() {

    function cit(name, options, config) {
        cct(name, Object.assign({
            plugins: [
                new WebpackCustomRuntime({ behavior: '' }),
                new WebpackCustomRuntime.ScriptAttr.Type(options),
            ]
        }, config));
    }

    cit('should not to override script type by default', {});

    cit('should override script type from options', { value: 'application/json' });

    cit('should override script type from config', {}, {
        output: {
            jsonpScriptType: 'module'
        }
    });
});
