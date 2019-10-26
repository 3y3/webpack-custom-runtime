'use strict';

const SyncWaterfallHook = require('tapable').SyncWaterfallHook;
const Definitions = require('./definitions');

const { pluginName, hooks, requireEnsureVars, pluginsToMute } = require('./config');

class CustomRuntimePlugin {
    constructor(options = {}) {
        this.options = Object.assign({
            behavior: 'default'
        }, options);
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(pluginName, compilation => {
            const { mainTemplate } = compilation;

            Object.keys(pluginsToMute).forEach((hookName) => {
                // fix for HtmlWebpackPlugin
                if (!mainTemplate.hooks[hookName]) {
                    return;
                }

                this.mutePlugins(mainTemplate.hooks[hookName], pluginsToMute[hookName]);
            });

            this.registerHooks(mainTemplate, hooks);
            this.redefineRequireEnsure(mainTemplate, requireEnsureVars);
        });

        if (this.options.behavior === 'default') {
            new CustomRuntimePlugin.ScriptAttr.Type().apply(compiler);
            new CustomRuntimePlugin.ScriptAttr.Timeout().apply(compiler);
            new CustomRuntimePlugin.ScriptAttr.Nonce().apply(compiler);
            new CustomRuntimePlugin.ScriptAttr.CrossOrigin().apply(compiler);
        }
    }

    mutePlugins(hook, plugins) {
        hook.intercept({
            register: (info) => {
                if (plugins.indexOf(info.name) === -1) {
                    return info;
                }

                return Object.assign({}, info, {
                    fn: () => {}
                });
            }
        });
    }

    registerHooks(mainTemplate, hooks = {}) {
        Object.keys(hooks).forEach((hook) => {
            mainTemplate.hooks[hook] = mainTemplate.hooks[hook] || new SyncWaterfallHook(hooks[hook]);
        });
    }

    redefineRequireEnsure(mainTemplate) {
        requireEnsureVars.forEach((name) => {
            Definitions[name](mainTemplate);
            Definitions.localFunction(mainTemplate, name);
        });

        Definitions.requireEnsure(mainTemplate);
    }
}

CustomRuntimePlugin.ExposeRequireEnsureRuntime = require('./plugins/ExposeRequireEnsureRuntime');
CustomRuntimePlugin.ScriptAttr = require('./plugins/ScriptAttr');
CustomRuntimePlugin.ErrorHandler = require('./plugins/ErrorHandler');
CustomRuntimePlugin.LoadHandler = require('./plugins/LoadHandler');
CustomRuntimePlugin.LoadingHandler = require('./plugins/LoadingHandler');
CustomRuntimePlugin.ModuleTimings = require('./plugins/ModuleTimings');

module.exports.CustomRuntimePlugin = CustomRuntimePlugin;
