'use strict';

const path = require('path');
const diff = require('diff');
const webpack = require('./utils/webpack');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

const mainOutputDir = path.join(__dirname, 'fixtures', 'dist');

describe('ScriptAttr(Type)', function() {

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
                    new WebpackCustomRuntime.ScriptAttr.Type(options),
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

    cit('should not to override script type by default', {});

    cit('should override script type from options', { value: 'application/json' });

    cit('should override script type from config', {}, {
        output: {
            path: mainOutputDir,
            filename: '[name].js',
            jsonpScriptType: 'module'
        }
    });
});
