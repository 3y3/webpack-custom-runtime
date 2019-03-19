'use strict';

const path = require('path');
const diff = require('diff');
const webpack = require('./utils/webpack');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

const mainOutputDir = path.join(__dirname, 'fixtures', 'dist');

describe('ExposeRequireEnsureRuntimePlugin', function() {

    function cit(name, options) {
        test(name, async function() {
            const base = webpack({
                plugins: [
                    new WebpackCustomRuntime({ behavior: '' }),
                ]
            });
            const curr = webpack({
                plugins: [
                    new WebpackCustomRuntime({ behavior: '' }),
                    new WebpackCustomRuntime.ExposeRequireEnsureRuntime(options),
                ]
            });

            await Promise.all([ base.result, curr.result ]);

            const baseDir = base.fs.readdirSync(mainOutputDir);
            const currDir = curr.fs.readdirSync(mainOutputDir);

            expect(baseDir).toEqual(currDir);

            currDir.forEach((file) => {
                const linesDiff = diff.createTwoFilesPatch(
                    file, file,
                    base.fs.readFileSync(mainOutputDir + '/' + file).toString(),
                    curr.fs.readFileSync(mainOutputDir + '/' + file).toString(),
                    '', '',
                    { context: 0 }
                );

                expect(linesDiff).toMatchSnapshot(file);
            });
        });
    }

    cit('should expose runtime in default namespace', {});

    cit('should expose runtime in custom namespace', { exposeTo: 'window.Ya' });

    const aliases = {
        scriptBuilder: 'sb',
        scriptUrlResolver: 'ur',
        scriptOptionsResolver: 'or',
        scriptLoadHandler: 'lh',
        scriptErrorHandler: 'eh'
    };

    Object.keys(aliases).forEach((key) => {
        cit(`should expose part of runtime for ${key}`, { exposeVars: { [key]: aliases[key] } });
    });
});
