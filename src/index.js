'use strict';

const SyncWaterfallHook = require('tapable').SyncWaterfallHook;
const Definitions = require('./definitions');

const { pluginName, hooks, requireEnsureVars } = require('./config');

class CustomRuntimePlugin {
    apply(compiler) {
        compiler.hooks.compilation.tap(pluginName, compilation => {
            const { mainTemplate } = compilation;
            this.registerHooks(mainTemplate, hooks);
            this.redefineRequireEnsure(mainTemplate, requireEnsureVars);
        });
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

module.exports.CustomRuntimePlugin = CustomRuntimePlugin;
