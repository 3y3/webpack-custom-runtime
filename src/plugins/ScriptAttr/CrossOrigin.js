'use strict';

const ScriptAttr = require('.');

class ScriptAttrCrossOrigin extends ScriptAttr {
    constructor(options) {
        super('CrossOrigin', Object.assign({
            value: undefined
        }, options));
    }

    optionsResolver(compilation) {
        const { value } = this.options;
        const { crossOriginLoading } = compilation.mainTemplate.outputOptions;

        const crossOrigin = value === undefined ? crossOriginLoading : value;

        if (!crossOrigin) {
            return;
        }

        return { crossOrigin };
    }

    codeResolver({ crossOrigin }, chunk, hash, { url, result }) {
        return `if (${url}.indexOf(window.location.origin + '/') !== 0) {
            ${result}.crossOrigin = ${JSON.stringify(crossOrigin)};
        }`;
    }
}

module.exports = ScriptAttrCrossOrigin;
