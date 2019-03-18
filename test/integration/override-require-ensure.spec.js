'use strict';

const path = require('path');
const diff = require('diff');
const webpack = require('./utils/webpack');
const WebpackCustomRuntime = require('../../').CustomRuntimePlugin;

const mainOutputDir = path.join(__dirname, 'fixtures', 'dist');

test('check require-ensure override', async () => {
    const base = webpack();
    const curr = webpack({
        plugins: [
            new WebpackCustomRuntime()
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
