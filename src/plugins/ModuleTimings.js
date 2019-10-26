'use strict';

const BasePlugin = require('./BasePlugin');
const LoadHandler = require('./LoadHandler');
const LoadingHandler = require('./LoadingHandler');
const resolveNamespace = require('../utils/resolve-namespace');

class ModuleTimings extends BasePlugin {

    constructor(options) {
        super('ComputeTimings', Object.assign({
            namespace: '{requireFn}.ModuleTimings',
            timer: 'performance.now'
        }, options));

        this.plugins.push(new LoadTiming(this.options));
        this.plugins.push(new LoadingTiming(this.options));
    }

    optionsResolver(compilation) {
        return {
            ns: resolveNamespace(this.options, compilation.mainTemplate.requireFn),
            timer: this.options.timer
        };
    }

    localVarsResolver({ ns }, chunk, hash) {
        const result = [`
            ${ns} = ${ns} || {};
        `];

        return result.join('\n');
    }
};

class LoadTiming extends LoadHandler {

    constructor(options) {
        super('ModuleTimings(LoadTiming)', options)
    }

    optionsResolver(compilation) {
        return {
            ns: resolveNamespace(this.options, compilation.mainTemplate.requireFn),
            timer: this.options.timer
        };
    }

    codeResolver({ ns, timer }, chunk, hash, { chunkId, result }) {
        return `
            var ns = ${ns};
            
            ns[${chunkId}] = ns[${chunkId}] || {};
            ns[${chunkId}].loadingEnd = ${timer}(); 
            
            return ${result};
        `;
    }
}

class LoadingTiming extends LoadingHandler {

    constructor(options) {
        super('ModuleTimings(LoadingTiming)', options)
    }

    optionsResolver(compilation) {
        return {
            ns: resolveNamespace(this.options, compilation.mainTemplate.requireFn),
            timer: this.options.timer
        };
    }

    codeResolver({ ns, timer }, chunk, hash, { chunkId, result }) {
        return `
            var ns = ${ns};
            
            ns[${chunkId}] = ns[${chunkId}] || {};
            ns[${chunkId}].loadingStart = ${timer}(); 
            
            return ${result};
        `;
    }
}

module.exports = ModuleTimings;
