const process = require('process');
const cp = require('child_process');
const path = require('path');

const root = process.cwd();
try {
    // build shared
    const sharedPath = path.join(root, 'projects', 'shared');
    cp.execSync(`npm i`, {
        cwd: sharedPath,
        stdio: 'inherit'
    });
    cp.execSync(`npm run build`, {
        cwd: sharedPath,
        stdio: 'inherit'
    });
    cp.execSync('npm pack', {
        cwd: sharedPath,
        stdio: 'inherit'
    })
    // build server
    const serverPath = path.join(root, 'projects', 'server');
    const sharedPackageJson = require(path.join(sharedPath, 'package.json'));
    const sharedPackageTarball = path.join(sharedPath, 
        `${sharedPackageJson.name}-${sharedPackageJson.version}.tgz`);
    cp.execSync(`npm i ${sharedPackageTarball}`, {
        cwd: serverPath,
        stdio: 'inherit'
    });
    cp.execSync('npm i', {
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