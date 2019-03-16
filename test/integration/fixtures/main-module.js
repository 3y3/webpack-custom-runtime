async function run() {
    console.log(await import('./async-submodule1'));
    console.log(await import('./async-submodule2'));
}

run();
