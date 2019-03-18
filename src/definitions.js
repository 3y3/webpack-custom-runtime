'use strict';

const pureScriptBuilder = require('./templates/pure-script-builder');
const pureRequireEnsure = require('./templates/pure-require-ensure');
const zip = require('./utils/array-to-hash');
const format = require('./utils/format-code');
const { pluginName, expressions } = require('./config');

const {
    scriptUrlResolver,
    scriptOptionsResolver,
    scriptLoadHandler,
    scriptErrorHandler
} = expressions;

module.exports = {
    scriptBuilder(mainTemplate) {
        mainTemplate.hooks.scriptBuilder.tap(pluginName, () => {
            return format(pureScriptBuilder.toString());
        });
    },

    scriptUrlResolver(mainTemplate) {
        const { installedChunks, chunkId, originalUrl, result } = expressions;

        mainTemplate.hooks.scriptUrlResolver.tap(pluginName, (source, chunk, hash) => {
            const strategies = mainTemplate.hooks.scriptUrlResolverStrategy.call(
                [], chunk, hash,
                { installedChunks, chunkId, originalUrl, result }
            );

            return format(`function ${scriptUrlResolver}(${installedChunks}, ${chunkId}) {
                var ${result} = ${originalUrl} = jsonpScriptSrc(${chunkId});
                
                ${strategies.join('\n')}
                
                return ${result};         
            }`);
        });
    },

    scriptOptionsResolver(mainTemplate) {
        const { installedChunks, chunkId, url, result } = expressions;

        mainTemplate.hooks.scriptOptionsResolver.tap(pluginName, (source, chunk, hash) => {
            const strategies = mainTemplate.hooks.scriptOptionsResolverStrategy.call(
                [], chunk, hash,
                { installedChunks, chunkId, url, result }
            );

            return format(`function ${scriptOptionsResolver}(${installedChunks}, ${chunkId}, ${url}) {
                var ${result} = {};
                
                ${strategies.join('\n')}

                return ${result};         
            }`);
        });
    },

    scriptLoadHandler(mainTemplate) {
        const { installedChunks, chunkId, result } = expressions;

        mainTemplate.hooks.scriptLoadHandler.tap(pluginName, (source, chunk, hash) => {
            const strategies = mainTemplate.hooks.scriptLoadHandlerStrategy.call(
                [], chunk, hash,
                { installedChunks, chunkId, result }
            );

            return format(`function ${scriptLoadHandler}(${installedChunks}, ${chunkId}) {
                var ${result} = null;
                
                ${strategies.join('\n')}

                return Promise.resolve(${result});         
            }`);
        });
    },

    scriptErrorHandler(mainTemplate) {
        const { installedChunks, chunkId, originalError, result } = expressions;

        mainTemplate.hooks.scriptErrorHandler.tap(pluginName, (source, chunk, hash) => {
            const strategies = mainTemplate.hooks.scriptErrorHandlerStrategy.call(
                [], chunk, hash,
                { installedChunks, chunkId, originalError, result }
            );

            return format(`function ${scriptErrorHandler}(${installedChunks}, ${chunkId}, ${originalError}) {
                var ${result} = ${originalError};
                
                ${strategies.join('\n')}

                return Promise.reject(${result});         
            }`);
        });
    },

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
