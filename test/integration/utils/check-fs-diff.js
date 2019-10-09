'use strict';

const path = require('path');
const diff = require('diff');

const mainOutputDir = path.join(__dirname, '..', 'fixtures', 'dist');

module.exports = function(base, curr) {
    const baseDir = base.fs.readdirSync(mainOutputDir);
    const currDir = curr.fs.readdirSync(mainOutputDir);

    expect(baseDir).toEqual(currDir);

    currDir.forEach((file) => {
        let changeIndex = 1;

        const linesDiff = diff.createTwoFilesPatch(
            file, file,
            base.fs.readFileSync(mainOutputDir + '/' + file).toString(),
            curr.fs.readFileSync(mainOutputDir + '/' + file).toString(),
            '', '',
            { context: 0 }
        ).replace(
            /@@ \-\d+,\d+? \+\d+,\d+? @@/g,
            () => `@@ Change ${changeIndex++} @@`
        );

        // Ignore diff like this:
        //       Index: test5.js
        //       ===================================================================
        //       --- test5.js
        //       +++ test5.js
        if (linesDiff.match(/^Index:\s(.*?)\n[=]+\n[-]{3}\s\1\s*\n[+]{3}\s\1\s*$/)) {
            return;
        }

        expect(linesDiff).toMatchSnapshot(file);
    });
};
