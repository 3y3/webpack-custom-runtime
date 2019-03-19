'use strict';

const path = require('path');
const diff = require('diff');
const webpack = require('./utils/webpack');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

const mainOutputDir = path.join(__dirname, 'fixtures', 'dist');

describe('ScriptAttr(Timeout)', function() {

    function cit(name, options, config) {
        test(name, async function() {
            const base = webpack({
                plugins: [
                    new WebpackCustomRuntime({ behavior: '' }),
                ]
            });
            const curr = webpack(Object.assign({
                plugins: [
                    new WebpackCustomRuntime({ behavior: '' }),
                    new WebpackCustomRuntime.ScriptAttr.Timeout(options),
                ]
            }, config));

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

    cit('should not to override script timeout by default', {});

    cit('should override script timeout from options', { value: 50 });

    cit('should override script type from config', {}, {
        output: {
            path: mainOutputDir,
            filename: '[name].js',
            chunkLoadTimeout: 60000
        }
    });
});
