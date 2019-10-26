# Webpack Custom Runtime

Плагин для Webpack упрощающий модификацию рантайм части вебпака.

Также содержит набор плагинов помогающих улучшить стабильность загрузки страницы. 

Эти же плагины являются примером обновленного подхода к расшаряемости рантайма.

### Пример подключения готового плагина
```js
const WebpackCustomRuntime = require('webpack-custom-runtime');

const config = {
    output: {},
    plugins: [
        new WebpackCustomRuntime(),
        new WebpackCustomRuntime.RetryOnError(),
    ]
};
```

### Пример добавления нового плагина
Создаем плагин, который комбинирует функциональность нескольких существующих точек расширения.

```js
const WebpackCustomRuntime = require('webpack-custom-runtime');

class ModuleTimings extends WebpackCustomRuntime.BasePlugin {

    constructor(options) {
        super('ComputeTimings', options);

        // Добавляем два зависимых плагина.
        // Они будут выполнены на этапе инициализации основного.
        this.plugins.push(new LoadTiming(this.options));
        this.plugins.push(new LoadingTiming(this.options));
    }

    optionsResolver(compilation) {
        return {
            ns: this.options.namespace
        };
    }

    // Объявляем новые переменные внутри рантайма вебпака
    // Они будут доступны в любой части рантайма, но не являются глобальными на странице. 
    localVarsResolver({ ns }, chunk, hash) {
        return `
           ${ns} = ${ns} || {};
       `;
    }
}

class LoadTiming extends WebpackCustomRuntime.LoadHandler {

    constructor(options) {
        super('ModuleTimings(LoadTiming)', options)
    }
    
    // Готовим дополнительные переменные для генерации кода.
    optionsResolver(compilation) {
        return {
            ns: this.options.namespace
            timer: this.options.timer
        };
    }

    // Добавляем в LoadHandler новую стратегию.
    // Их может быть много разных.
    codeResolver({ ns, timer }, chunk, hash, { chunkId, result }) {
        return writeTiming('loadingEnd', ns, timer, chunkId, result);
    }
}

class LoadingTiming extends WebpackCustomRuntime.LoadingHandler {

    constructor(options) {
        super('ModuleTimings(LoadingTiming)', options)
    }

    optionsResolver(compilation) {
        return {
            ns: this.options.namespace,
            timer: this.options.timer
        };
    }

    codeResolver({ ns, timer }, chunk, hash, { chunkId, result }) {
        return writeTiming('loadingStart', ns, timer, chunkId, result);
    }
}

function writeTiming(timingName, ns, timer, chunkId, result) {
    return `
       var ns = ${ns};
       
       ns[${chunkId}] = ns[${chunkId}] || {};
       ns[${chunkId}].${timingName} = ${timer}(); 
       
       return ${result};
   `;
}


module.exports = ModuleTimings;

```

Используем созданный плагин.
```js
const WebpackCustomRuntime = require('webpack-custom-runtime');
const ModuleTimings = require('./ModuleTimings');

const config = {
    output: {},
    plugins: [
        new WebpackCustomRuntime(),
        new ModuleTimings()
    ]
};
```
