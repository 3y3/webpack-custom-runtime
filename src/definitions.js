'use strict';

const pureRequireEnsure = require('./templates/pure-require-ensure');
const zip = require('./utils/array-to-hash');
const format = require('./utils/format-code');
const { pluginName } = require('./config');
module.exports = {
    requireEnsure(mainTemplate, requireEnsureVars) {
        const customCallArgs = requireEnsureVars.join(', ');
        const expressions = zip(requireEnsureVars);

        mainTemplate.hooks.requireEnsure.tap(`${pluginName} load`, (source, chunk, hash) => {
            const ensure = pureRequireEnsure.toString();

            const prepareEnv = mainTemplate.hooks.requireEnsureVars.call('', chunk, hash, expressions);
            const callArgs = `installedChunks, chunkId, ${customCallArgs}`;

            return format(`
                ${prepareEnv}
                var result = (${ensure})(${callArgs});
                if (result) {
                    promises.push.apply(promises, [].concat(result));
                }
            `);
        });
    },

    localFunction(mainTemplate, varName) {
        mainTemplate.hooks.localVars.tap(pluginName, (source, chunk, hash) => {
            const definition = mainTemplate.hooks[varName].call(this, '', chunk, hash);
            const result = format(definition);

            return [ source, result ].join('\n');
        });
    }
};
