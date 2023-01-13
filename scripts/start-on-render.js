const process = require('process');
const cp = require('child_process');
const path = require('path');

const root = process.cwd();
try {
    const serverPath = path.join(root, 'projects', 'server');
    cp.execSync('npx phaser-game-server -s -c server.config.prod.json', {
        cwd: serverPath,
        stdio: 'inherit'
    });
} catch (e) {
    console.error(e);
    process.exit(1);
}