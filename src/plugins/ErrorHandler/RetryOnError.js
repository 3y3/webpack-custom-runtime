'use strict';

const ErrorHandler = require('.');
const replaceEnv = require('../../utils/replace-env');

class RetryOnError extends ErrorHandler {

    constructor(options) {
        super('RetryOnError', Object.assign({
            enabled: true,
            namespace: '{requireFn}.RetryOnError',
            waitOnline: false,
            maxRetryCount: 1
        }, options));
    }

    resolveNamespace(mainTemplate) {
        let namespace = replaceEnv(this.options.namespace, {
            requireFn: mainTemplate.requireFn
        });

        if (!namespace.match(/.*?\..*?|.*?\[.*?\]/)) {
            namespace = 'window.' + namespace;
        }

        return namespace;
    }

    optionsResolver(compilation) {
        if (!this.options.enabled) {
            return;
        }

        const { mainTemplate } = compilation;
        const namespace = this.resolveNamespace(mainTemplate);

        return {
            ns: namespace,
            requireFn: mainTemplate.requireFn,
            waitOnline: this.options.waitOnline,
            maxRetryCount: this.options.maxRetryCount
        };
    }

    localVarsResolver({ ns, waitOnline }, chunk, hash) {
        const result = [`
            ${ns} = ${ns} || {};

            var ns = ${ns};
            ns.max = ns.max || (${this.options.maxRetryCount} || 0);
            ns.retries = ns.retries || {};
        `];

        if (waitOnline) {
            result.push(`
                ns.waitOnline = function() {
                    return new Promise(function(resolve) {
                        if (navigator.onLine) {
                            resolve();
                        } else {
                            window.addEventListener('online', function onOnline() {
                                window.removeEventListener('online', onOnline);
                                resolve();
                            });
                        }
                    });
                };
            `);
        }

        return result.join('\n');
    }

    codeResolver({ ns, requireFn, waitOnline }, chunk, hash, { chunkId, originalError, result }) {
        return `
            var ns = ${ns};
            var retries = ns.retries[${chunkId}] || 0;
             
            if (retries >= ns.max) {
                return ${result};
            }
            
            ns.retries[${chunkId}] = retries + 1;
            
            return ${ waitOnline ? `ns.waitOnline()` : 'Promise.resolve()' }
                .then(function() { return ${requireFn}.e(${chunkId}); })
                .then(function() {}); // Resolve empty value
        `;
    }
}

module.exports = RetryOnError;
