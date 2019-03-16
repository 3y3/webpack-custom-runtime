const path = require('path');
const webpack = require('./utils/webpack');

const mainOutputDir = path.join(__dirname, 'fixtures', 'dist');

test('check default output', async () => {
    const { result, fs } = webpack();
    await result;

    const dir = fs.readdirSync(mainOutputDir);

    dir.forEach((file) => {
        const content = fs.readFileSync(mainOutputDir + '/' + file).toString();
        expect(content).toMatchSnapshot(file);
    });
});
