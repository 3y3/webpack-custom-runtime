'use strict';

const cct = require('./utils/custom-configurable-test');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

describe('ExposeRequireEnsureRuntimePlugin', function() {

    function cit(name, options, config) {
        cct(name, Object.assign({
            plugins: [
                new WebpackCustomRuntime({ behavior: '' }),
                new WebpackCustomRuntime.ExposeRequireEnsureRuntime(options),
            ]
        }, config));
    }

    cit('should expose runtime in default namespace', {});

    cit('should expose runtime in custom namespace', { exposeTo: 'window.Ya' });

    const aliases = {
        scriptBuilder: 'sb',
        scriptUrlResolver: 'ur',
        scriptOptionsResolver: 'or',
        scriptLoadHandler: 'lh',
        scriptErrorHandler: 'eh'
    };

    Object.keys(aliases).forEach((key) => {
        cit(`should expose part of runtime for ${key}`, { exposeVars: { [key]: aliases[key] } });
    });
});
