const process = require('process');
const cp = require('child_process');
const path = require('path');

const root = process.cwd();
try {
    const serverPath = path.join(root, 'projects', 'server');
    cp.execSync('npm run open', {
        cwd: serverPath,
        stdio: 'inherit'
    });
} catch (e) {
    console.error(e);
    process.exit(1);
}