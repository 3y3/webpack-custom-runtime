'use strict';

const path = require('path');
const diff = require('diff');

const mainOutputDir = path.join(__dirname, '..', 'fixtures', 'dist');

module.exports = function(base, curr) {
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
};
