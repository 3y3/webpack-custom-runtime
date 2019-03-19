'use strict';

const cct = require('./utils/custom-configurable-test');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

describe('ScriptAttr(Nonce)', function() {

    function cit(name, options, config) {
        cct(name, Object.assign({
            plugins: [
                new WebpackCustomRuntime({ behavior: '' }),
                new WebpackCustomRuntime.ScriptAttr.Nonce(options),
            ]
        }, config));
    }

    cit('should override script nonce by default', { value: 'Ya.nonce' });

    cit('should override script nonce from custom holder', { value: 'Ya.nonce' });

    cit('should not to override script nonce with empty holder', { value: '' });
});
