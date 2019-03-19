'use strict';

const cct = require('./utils/custom-configurable-test');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

describe('ScriptAttr(CrossOrigin)', function() {

    function cit(name, options, config) {
        cct(name, Object.assign({
            plugins: [
                new WebpackCustomRuntime({ behavior: '' }),
                new WebpackCustomRuntime.ScriptAttr.CrossOrigin(options),
            ]
        }, config));
    }

    cit('should not to override script crossorigin by default', {});

    cit('should override script crossorigin from options', { value: 'with-credentials' });

    cit('should override script crossorigin from config', {}, {
        output: {
            crossOriginLoading: 'anonymous'
        }
    });
});
