'use strict';

const ScriptAttr = require('.');

class ScriptAttrTimeout extends ScriptAttr {
    constructor(options = {}) {
        super('Timeout', Object.assign({
            value: undefined
        }, options));
    }

    optionsResolver(compilation) {
        const { value } = this.options;
        const { chunkLoadTimeout } = compilation.mainTemplate.outputOptions;

        const timeout = value === undefined ? chunkLoadTimeout / 1000 : value;

        if (isNaN(timeout)) {
            return;
        }

        return { timeout };
    }

    codeResolver({ timeout }, chunk, hash, { result }) {
        return `${result}.timeout = ${timeout};`;
    }
}

module.exports = ScriptAttrTimeout;
