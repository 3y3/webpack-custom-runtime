'use strict';

const ScriptAttr = require('.');
const replaceEnv = require('../../utils/replace-env');

class ScriptAttrNonce extends ScriptAttr {
    constructor(options) {
        super('Nonce', Object.assign({
            value: '{requireFn}.nc'
        }, options));
    }

    optionsResolver(compilation) {
        if (!this.options.value) {
            return;
        }

        const valueHolder = replaceEnv(this.options.value, {
            requireFn: compilation.mainTemplate.requireFn
        });

        return { valueHolder };
    }

    codeResolver({ valueHolder }, chunk, hash, { result }) {
        return `if (${valueHolder}) {
            ${result}.nonce = ${valueHolder};
        }`;
    }
}

module.exports = ScriptAttrNonce;
