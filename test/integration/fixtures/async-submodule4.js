export const foo = 'foo';

async function run() {
    console.log(await import(/* webpackChunkName: "test5", webpackPreload: true */ './async-submodule5'));
}

run();
