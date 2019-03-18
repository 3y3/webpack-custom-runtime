'use strict';

const pluginName = 'ExposeRequireEnsureRuntimePlugin';
const zip = require('../utils/array-to-hash');
const replaceEnv = require('../utils/replace-env');
const { requireEnsureVars } = require('../config');

const exposableVars = zip(requireEnsureVars);

/**
 * Плагин расширяющий функциональность WebpackCustomRuntimePlugin.
 * Добавляет возможность получить доступ до частей рантайма используемых в __webpack_require__.e.
 * В том числе переопределить их в рантайме.
 */
class ExposeRequireEnsureRuntimePlugin {

    /**
     * @typedef {String} From
     */

    /**
     * @typedef {String} To
     */

    /**
     * @constructor
     *
     * @param {Object|String} [options]
     * @param {String} [options.exposeTo]='{requireFn}.CustomRuntime' -
     *   Переменная в которую нужно записать рантайм окружение.
     *   Можно использовать шаблон, для встраивания в __webpack_require__. Пример '{requireFn}.CustomRuntime'.
     *   При falsy значении плагин считается выключенным.
     * @param {Object.<From,To>|Array.<From>} [options.exposeVars] -
     *   Набор переменных к которым нужно предоставить доступ через алиасы.
     *   Если массив - используются алиасы по умолчанию.
     *   Если обьект - используются алиасы указанные в значениях ключей.
     * @param {String} [options.exposeVars.scriptBuilder]
     * @param {String} [options.exposeVars.scriptUrlResolver]
     * @param {String} [options.exposeVars.scriptOptionsResolver]
     * @param {String} [options.exposeVars.scriptLoadHandler]
     * @param {String} [options.exposeVars.scriptErrorHandler]
     */
    constructor(options) {
        if (typeof options === 'string') {
            options = {
                exposeTo: options
            };
        }

        options = options || {};

        options.exposeTo = options.exposeTo === undefined
            ? '{requireFn}.CustomRuntime'
            : options.exposeTo;

        options.exposeVars = options.exposeVars || exposableVars;

        if (Array.isArray(options.exposeVars)) {
            options.exposeVars = options.exposeVars.reduce((acc, name) => {
                if (exposableVars[name]) {
                    acc[name] = exposableVars[name];
                }

                return acc;
            }, {});
        }

        options.exposeVars = Object.keys(options.exposeVars).reduce((acc, name) => {
            if (exposableVars[name] && options.exposeVars[name]) {
                acc[name] = typeof options.exposeVars[name] === 'string'
                    ? options.exposeVars[name]
                    : exposableVars[name];
            }

            return acc;
        }, {});

        this.options = options;
    }

    apply(compiler) {
        const options = this.options;

        if (!options.exposeTo) {
            return;
        }

        compiler.hooks.compilation.tap(pluginName, (compilation) => {
            const { mainTemplate } = compilation;

            const runtime = this._getRuntimeExpression(mainTemplate);

            mainTemplate.hooks.localVars.tap(pluginName, (source) => {
                return [ source, `${runtime} = ${runtime} || {};` ].join('\n');
            });

            Object.keys(options.exposeVars).forEach((name) => {
                this._exposeVariable(mainTemplate, name, options.exposeVars[name]);
            });
        });
    }

    _getRuntimeExpression(mainTemplate) {
        return replaceEnv(this.options.exposeTo, {
            requireFn: mainTemplate.requireFn
        });
    }

    _exposeVariable(mainTemplate, from, to) {
        if (!from || !to) {
            return;
        }

        const runtime = this._getRuntimeExpression(mainTemplate);
        const expose = `${runtime}['${to}']`;

        mainTemplate.hooks.localVars.tap(pluginName, (source) => {
            return [ source, `${expose} = ${from};` ].join('\n');
        });

        mainTemplate.hooks.requireEnsureVars.tap(pluginName, (source) => {
            return [ source, `var ${from} = ${expose};` ].join('\n');
        });
    }
}

module.exports = ExposeRequireEnsureRuntimePlugin;
