'use strict';

const ErrorHandler = require('.');
const replaceEnv = require('../../utils/replace-env');

class RetryOnError extends ErrorHandler {

    constructor(options) {
        super('RetryOnError', Object.assign({
            enabled: true,
            namespace: '{requireFn}.RetryOnError',
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

        return namespace
            .replace(/\["/g, '[\'')
            .replace(/"\]/g, '\']');
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
            maxRetryCount: this.options.maxRetryCount
        };
    }

    localVarsResolver({ ns }, chunk, hash) {
        return `
            ${ns} = ${ns} || {};

            var ns = ${ns};
            ns.max = ns.max || (${this.options.maxRetryCount} || 0);
            ns.retries = ns.retries || {};
        `;
    }

    codeResolver({ ns, requireFn }, chunk, hash, { chunkId, originalError, result }) {
        return `
            var ns = ${ns};
            var retries = ns.retries[${chunkId}] || 0;
             
            if (retries >= ns.max) {
                return ${result};
            }
            
            ns.retries[${chunkId}] = retries + 1;
            
            return Promise.resolve()
                .then(function() { return ${requireFn}.e(${chunkId}); })
                .then(function() {}); // Resolve empty value
        `;
    }
}

module.exports = RetryOnError;
