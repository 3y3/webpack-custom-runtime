'use strict';

class ScriptAttrPlugin {

    constructor(name, options, optionsResolver, codeResolver) {
        this.options = options;
        this.pluginName = `ScriptAttr(${name})`;

        if (optionsResolver) {
            this.optionsResolver = optionsResolver
        }

        if (codeResolver) {
            this.codeResolver = codeResolver;
        }
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(this.pluginName, compilation => {
            const { mainTemplate } = compilation;

            const options = this.optionsResolver(compilation);

            if (!options) {
                return;
            }

            mainTemplate.hooks.scriptOptionsResolverStrategy.tap(
                this.pluginName,
                (array, chunk, hash, expressions) => {
                    const prop = this.codeResolver(options, chunk, hash, expressions);

                    if (prop) {
                        array.push(prop);
                    }

                    return array;
                }
            );
        });
    }

    /**
     * @virtual
     * @protected
     * @returns {?Object}
     */
    optionsResolver(compilation) {
        return {};
    }

    /**
     * @virtual
     * @protected
     * @returns {?String}
     */
    codeResolver(options, chunk, hash, expressions) {}
}

module.exports = ScriptAttrPlugin;

ScriptAttrPlugin.Type = require('./Type');
ScriptAttrPlugin.Timeout = require('./Timeout');
