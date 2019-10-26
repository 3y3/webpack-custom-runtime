'use strict';

const cct = require('./utils/custom-configurable-test');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

describe('ModuleTimings', function() {

    function cit(name, options, config) {
        cct(name, Object.assign({
            plugins: [
                new WebpackCustomRuntime({ behavior: '' }),
                new WebpackCustomRuntime.ModuleTimings(options),
            ]
        }, config));
    }

    cit('should setup default timings', {});

    cit('should configure timing function', {
        timer: 'Date.now'
    });
});
