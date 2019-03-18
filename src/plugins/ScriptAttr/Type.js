'use strict';

const ScriptAttr = require('.');

class ScriptAttrType extends ScriptAttr {
    constructor(options = {}) {
        super('Type', Object.assign({
            value: undefined
        }, options));
    }

    optionsResolver(compilation) {
        const { value } = this.options;
        const { jsonpScriptType } = compilation.mainTemplate.outputOptions;

        const type = value === undefined ? jsonpScriptType : value;

        if (!type) {
            return;
        }

        return { type };
    }

    codeResolver({ type }, chunk, hash, { result }) {
        return `${result}.type = ${JSON.stringify(type)};`;
    }
}

module.exports = ScriptAttrType;
