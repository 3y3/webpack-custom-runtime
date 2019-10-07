'use strict';

const SyncWaterfallHook = require('tapable').SyncWaterfallHook;
const Definitions = require('./definitions');

const { pluginName, hooks, requireEnsureVars } = require('./config');

class CustomRuntimePlugin {
    constructor(options = {}) {
        this.options = Object.assign({
            behavior: 'default'
        }, options);
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(pluginName, compilation => {
            const { mainTemplate } = compilation;
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

    registerHooks(mainTemplate, hooks = {}) {
        Object.keys(hooks).forEach((hook) => {
            mainTemplate.hooks[hook] = mainTemplate.hooks[hook] || new SyncWaterfallHook(hooks[hook]);
        });
    }

    redefineRequireEnsure(mainTemplate, requireEnsureVars = []) {
        requireEnsureVars.forEach((name) => {
            Definitions[name](mainTemplate);
            Definitions.localFunction(mainTemplate, name);
        });

        Definitions.requireEnsure(mainTemplate, requireEnsureVars);
    }
}

CustomRuntimePlugin.ExposeRequireEnsureRuntime = require('./plugins/ExposeRequireEnsureRuntime');
CustomRuntimePlugin.ScriptAttr = require('./plugins/ScriptAttr');
CustomRuntimePlugin.ErrorHandler = require('./plugins/ErrorHandler');

module.exports.CustomRuntimePlugin = CustomRuntimePlugin;
