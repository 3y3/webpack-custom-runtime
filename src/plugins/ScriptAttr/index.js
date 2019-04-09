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

            this.setupExtraHooks(compilation, options);

            mainTemplate.hooks.localVars.tap(
                this.pluginName,
                (source, chunk, hash) => {
                    const code = this.localVarsResolver(options, chunk, hash);

                    if (code) {
                        source += '\n' + code;
                    }

                    return source;
                }
            );

            mainTemplate.hooks.scriptOptionsResolverStrategy.tap(
                this.pluginName,
                (array, chunk, hash, expressions) => {
                    const code = this.codeResolver(options, chunk, hash, expressions);

                    if (code) {
                        array.push(code);
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
     */
    setupExtraHooks(compilation, options) {}

    /**
     * @virtual
     * @protected
     * @returns {?String}
     */
    localVarsResolver(options, chunk, hash) {}

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
ScriptAttrPlugin.Nonce = require('./Nonce');
ScriptAttrPlugin.Integrity = require('./Integrity');
ScriptAttrPlugin.CrossOrigin = require('./CrossOrigin');
