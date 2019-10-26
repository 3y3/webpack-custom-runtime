'use strict';

const pureScriptBuilder = require('./templates/pure-script-builder');
const purePrelinkBuilder = require('./templates/pure-prelink-builder');
const pureRequireEnsure = require('./templates/pure-require-ensure');
const replaceEnv = require('./utils/replace-env');
const zip = require('./utils/array-to-hash');
const format = require('./utils/format-code');
const { pluginName, expressions, requireEnsureBaseVars, requireEnsureVars } = require('./config');

const {
    requireEnsure,
    scriptUrlResolver,
    scriptOptionsResolver,
    scriptLoadHandler,
    scriptErrorHandler,
    scriptLoadingHandler
} = expressions;

function wrapStrategy(strategy, args = '') {
    if (typeof strategy === 'function') {
        return strategy.toString();
    } else {
        return `function(${args}) {
            ${strategy}
        }`;
    }
}

function wrapSyncStrategy(strategy) {
    if (typeof strategy === 'function') {
        return strategy.toString();
    } else {
        return `(${wrapStrategy(strategy)})();`;
    }
}

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

            const args = `${installedChunks}, ${chunkId}, ${mode}`;
            const wrappedStrategies = strategies.map(wrapSyncStrategy);

            const processor = wrappedStrategies.length
                ? `
                    ${mode} = ${mode} || 'load';
    
                    var ${result} = ${originalUrl} = jsonpScriptSrc(${chunkId});                
                    
                    ${wrappedStrategies.join('\n')}
                    
                    return ${result};
                `
                : `return jsonpScriptSrc(${chunkId});`;

            return format(`function ${scriptUrlResolver}(${args}) {
                ${processor}
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

            const args = `${installedChunks}, ${chunkId}, ${url}, ${mode}`;
            const wrappedStrategies = strategies.map(wrapSyncStrategy);

            const processor = wrappedStrategies.length
                ? `
                    ${mode} = ${mode} || 'load';
    
                    var ${result} = {};     
                    
                    ${wrappedStrategies.join('\n')}
                    
                    return ${result};
                `
                : 'return {};';

            return format(`function ${scriptOptionsResolver}(${args}) {
                ${processor}
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

            const args = `${installedChunks}, ${chunkId}, ${result}`;
            const wrappedStrategies = strategies.map((strategy) => wrapStrategy(strategy, args));

            const strategyProcessor = `[${wrappedStrategies.join(',')}]
                .reduce(function(promise, strategy) {
                    return promise.then(function(${result}) {
                        return strategy(${args});
                    });
                }, Promise.resolve());`;

            const processor = strategies.length
                ? strategyProcessor
                : `Promise.resolve()`;

            return format(`function ${scriptLoadHandler}(${installedChunks}, ${chunkId}) {
                return ${processor};         
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

            const args = `${installedChunks}, ${chunkId}, ${originalError}, ${result}`;
            const wrappedStrategies = strategies.map((strategy) => wrapStrategy(strategy, args));

            const strategyProcessor = `[${wrappedStrategies.join(',')}]
                .reduce(function(promise, strategy) {
                    return promise.then(function(${result}) {
                        return strategy(${args});
                    });
                }, Promise.resolve(${originalError})).then(function(${result}) {
                    return ${result}
                        ? Promise.reject(${result})
                        : Promise.resolve();
                })`;

            const processor = strategies.length
                ? strategyProcessor
                : `Promise.reject(${originalError})`;

            return format(`function ${scriptErrorHandler}(${installedChunks}, ${chunkId}, ${originalError}) {
                return ${processor};
            }`);
        });
    },

    scriptLoadingHandler(mainTemplate) {
        const { installedChunks, chunkId, result } = expressions;

        mainTemplate.hooks.scriptLoadingHandler.tap(pluginName, (source, chunk, hash) => {
            const strategies = mainTemplate.hooks.scriptLoadingHandlerStrategy.call(
                [], chunk, hash,
                { installedChunks, chunkId, result }
            );

            const args = `${installedChunks}, ${chunkId}, ${result}`;
            const wrappedStrategies = strategies.map((strategy) => wrapStrategy(strategy, args));

            const strategyProcessor = `[${wrappedStrategies.join(',')}]
                .reduce(function(promise, strategy) {
                    return promise.then(function(${result}) {
                        return strategy(${args});
                    });
                }, Promise.resolve(${result}));`;

            const processor = strategies.length
                ? strategyProcessor
                : `Promise.resolve()`;

            return format(`function ${scriptLoadingHandler}(${installedChunks}, ${chunkId}, ${result}) {
                return ${processor};         
            }`);
        });
    },

    requireEnsure(mainTemplate) {
        const expressions = zip(requireEnsureVars);

        mainTemplate.hooks.requireEnsure.tap(`${pluginName} env`, (source, chunk, hash) => {
            const prepareEnv = mainTemplate.hooks.requireEnsureVars.call('', chunk, hash, expressions);

            return [ source, format(prepareEnv) ].join('\n');
        });

        mainTemplate.hooks.localVars.tap(pluginName, (source, chunk, hash) => {
            const result = format(`
                var ${requireEnsure} = ${pureRequireEnsure.toString()};
            `);

            return [ source, result ].join('\n');
        });

        mainTemplate.hooks.requireEnsure.tap(`${pluginName} load`, (source) => {
            const customCallArgs = requireEnsureVars.join(', ');
            const callArgs = `installedChunks, chunkId, ${customCallArgs}`;
            const result = format(`
                var result = (${requireEnsure})(${callArgs});

                if (result) {
                    promises.push.apply(promises, [].concat(result));
                }
            `);

            return [ source, result ].join('\n');
        });

        // WebpackHtmlPlugin has no linkPreload tapable
        if (mainTemplate.hooks.linkPreload) {
            mainTemplate.hooks.linkPreload.tap(`${pluginName} preload`, () => {
                const customCallArgs = requireEnsureBaseVars.join(', ');
                const callArgs = `installedChunks, chunkId, ${customCallArgs}`;
                const preload = replaceEnv(purePrelinkBuilder.toString(), {
                    linkType: 'preload'
                });

                return format(`
                    var link = (${preload})(${callArgs});
                `);
            });
        }

        // WebpackHtmlPlugin has no linkPrefetch tapable
        if (mainTemplate.hooks.linkPrefetch) {
            mainTemplate.hooks.linkPrefetch.tap(`${pluginName} prefetch`, () => {
                const customCallArgs = requireEnsureBaseVars.join(', ');
                const callArgs = `installedChunks, chunkId, ${customCallArgs}`;
                const prefetch = replaceEnv(purePrelinkBuilder.toString(), {
                    linkType: 'prefetch'
                });

                return format(`
                    var link = (${prefetch})(${callArgs});
                `);
            });
        }
    },

    localFunction(mainTemplate, varName) {
        mainTemplate.hooks.localVars.tap(pluginName, (source, chunk, hash) => {
            const definition = mainTemplate.hooks[varName].call(this, '', chunk, hash);
            const result = format(definition);

            return [ source, result ].join('\n');
        });
    }
};
