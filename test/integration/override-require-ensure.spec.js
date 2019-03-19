'use strict';

const path = require('path');
const diff = require('diff');
const webpack = require('./utils/webpack');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

const mainOutputDir = path.join(__dirname, 'fixtures', 'dist');

describe.only('require-ensure override', function() {

    function cit(name, options, config) {
        test(name, async () => {
            const base = webpack();
            const curr = webpack(Object.assign({
                plugins: [
                    new WebpackCustomRuntime(options)
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

    cit('should implement default webpack behavior', {}, {
        output: {
            path: mainOutputDir,
            filename: '[name].js',
            jsonpScriptType: 'module',
            chunkLoadTimeout: 60000,
            crossOriginLoading: 'anonymous',
        }
    });

    cit('should skip defaults on custom behavior', { behavior: '' });
});
