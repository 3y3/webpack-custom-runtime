async function run() {
    console.log(await import('./async-submodule1'));
    console.log(await import('./async-submodule2'));
    console.log(await import(/* webpackChunkName: "test1", webpackPrefetch: true */ './async-submodule3'));
    console.log(await import(/* webpackChunkName: "test2", webpackPreload: true */ './async-submodule4'));
}

run();
