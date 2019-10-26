'use strict';

const format = require('../utils/format-code');

class BasePlugin {

    constructor(name, options, strategyConsumer) {
        this.options = Object.assign({
            enabled: true
        }, options);
        this.pluginName = name;
        this.strategyConsumer = strategyConsumer;
        this.plugins = [];
    }

    apply(compiler) {
        if (!this.options.enabled) {
            return;
        }

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
                        source += '\n' + format(code);
                    }

                    return source;
                }
            );

            if (this.strategyConsumer) {
                mainTemplate.hooks[this.strategyConsumer].tap(
                    this.pluginName,
                    (array, chunk, hash, expressions) => {
                        const code = this.codeResolver(options, chunk, hash, expressions);

                        if (code) {
                            array.push(code);
                        }

                        return array;
                    }
                );
            }
        });

        this.plugins.forEach((plugin) => {
            plugin.apply(compiler);
        })
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

module.exports = BasePlugin;
