'use strict';

const ErrorHandler = require('.');

class RetryOnError extends ErrorHandler {

    constructor(options) {
        super('RetryOnError', Object.assign({
            enabled: true,
            maxRetryCount: 1
        }, options));
    }

    optionsResolver(compilation) {
        if (!this.options.enabled) {
            return;
        }

        return {
            ns: 'RetryOnError',
            requireFn: compilation.mainTemplate.requireFn,
            maxRetryCount: this.options.maxRetryCount
        };
    }

    localVarsResolver({ ns }, chunk, hash) {
        return `var ${ns} = { max: (${this.options.maxRetryCount} || 1), cache: {} };`;
    }

    codeResolver({ ns, requireFn }, chunk, hash, { chunkId, originalError, result }) {
        return `
            var retries = ${ns}.cache[${chunkId}] || 0;
             
            if (retries >= ${ns}.max) {
                return ${result};
            }
            
            ${ns}.cache[${chunkId}] = retries + 1;
            
            return ${requireFn}.e(${chunkId}).then(function() {});
        `;
    }
}

module.exports = RetryOnError;
