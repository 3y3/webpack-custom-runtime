'use strict';

const pureScriptBuilder = require('./templates/pure-script-builder');
const purePreloadBuilder = require('./templates/pure-preload-builder');
const pureRequireEnsure = require('./templates/pure-require-ensure');
const zip = require('./utils/array-to-hash');
const format = require('./utils/format-code');
const { pluginName, expressions, requireEnsureBaseVars, requireEnsureVars } = require('./config');

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
        const { installedChunks, chunkId, originalUrl, result, mode } = expressions;

        mainTemplate.hooks.scriptUrlResolver.tap(pluginName, (source, chunk, hash) => {
            const strategies = mainTemplate.hooks.scriptUrlResolverStrategy.call(
                [], chunk, hash,
                { installedChunks, chunkId, originalUrl, result, mode }
            );

            return format(`function ${scriptUrlResolver}(${installedChunks}, ${chunkId}, ${mode}) {
                var ${result} = ${originalUrl} = jsonpScriptSrc(${chunkId});
                
                ${mode} = ${mode} || 'load';
                ${strategies.join('\n')}
                
                return ${result};         
            }`);
        });
    },

    scriptOptionsResolver(mainTemplate) {
        const { installedChunks, chunkId, url, result, mode } = expressions;

        mainTemplate.hooks.scriptOptionsResolver.tap(pluginName, (source, chunk, hash) => {
            const strategies = mainTemplate.hooks.scriptOptionsResolverStrategy.call(
                [], chunk, hash,
                { installedChunks, chunkId, url, result, mode }
            );

            return format(`function ${scriptOptionsResolver}(${installedChunks}, ${chunkId}, ${url}, ${mode}) {
                var ${result} = {};
                
                ${mode} = ${mode} || 'load';
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

            const wrappedStrategies = strategies.map((strategy) => {
                if (typeof strategy === 'function') {
                    return strategy.toString();
                } else {
                    return `function(${installedChunks}, ${chunkId}, ${originalError}, ${result}) {${strategy}}`;
                }
            });

            const strategyProcessor = `[${wrappedStrategies.join(',')}]
                .reduce(function(promise, strategy) {
                    return promise.then(function(${result}) {
                        return strategy(${installedChunks}, ${chunkId}, ${originalError}, ${result});
                    });
                }, Promise.resolve(${originalError})).then(function(${result}) {
                    return ${result}
                        ? Promise.reject(${result})
                        : Promise.resolve();
                })`;

            return format(`function ${scriptErrorHandler}(${installedChunks}, ${chunkId}, ${originalError}) {
                return ${
                strategies.length
                    ? strategyProcessor
                    : `Promise.reject(${originalError})`
                };
            }`);
        });
    },

    requireEnsure(mainTemplate) {
        const expressions = zip(requireEnsureVars);

        mainTemplate.hooks.requireEnsure.tap(`${pluginName} env`, (source, chunk, hash) => {
            const prepareEnv = mainTemplate.hooks.requireEnsureVars.call('', chunk, hash, expressions);

            return [ source, format(prepareEnv) ].join('\n');
        });

        mainTemplate.hooks.requireEnsure.tap(`${pluginName} load`, (source) => {
            const customCallArgs = requireEnsureVars.join(', ');
            const callArgs = `installedChunks, chunkId, ${customCallArgs}`;
            const ensure = pureRequireEnsure.toString();
            const result = format(`
                var result = (${ensure})(${callArgs});

                if (result) {
                    promises.push.apply(promises, [].concat(result));
                }
            `);

            return [ source, result ].join('\n');
        });

        mainTemplate.hooks.linkPreload.tap(`${pluginName} preload`, (source, chunk) => {
            const customCallArgs = requireEnsureBaseVars.join(', ');
            const callArgs = `installedChunks, chunkId, ${customCallArgs}`;
            const preload = purePreloadBuilder.toString();

            return format(`
                var link = (${preload})(${callArgs});
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
