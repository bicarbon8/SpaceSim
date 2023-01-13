const process = require('process');
const cp = require('child_process');
const path = require('path');

const root = process.cwd();
try {
    // build shared
    const sharedPath = path.join(root, 'projects', 'shared');
    cp.execSync(`npm ci`, {
        cwd: sharedPath,
        stdio: 'inherit'
    });
    cp.execSync(`npm run build`, {
        cwd: sharedPath,
        stdio: 'inherit'
    });
    // build server
    const serverPath = path.join(root, 'projects', 'server');
    cp.execSync(`npm ci`, {
        cwd: serverPath,
        stdio: 'inherit'
    });
    cp.execSync(`npm run build`, {
        cwd: serverPath,
        stdio: 'inherit'
    });
} catch (e) {
    console.error(e);
    process.exit(1);
}