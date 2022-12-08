import express from 'express';
import * as http from 'http';
import * as path from 'path';
import { JSDOM, VirtualConsole } from 'jsdom';
import { Server } from 'socket.io';
import * as devenv from './environments/environment.js';
import * as prodenv from './environments/environment.prod.js';

const env = (process.env.production) ? prodenv : devenv;

const app = express();
app.use(express.static(path.join(process.cwd(), 'dist')));
app.get('/', function (req, res) {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

const server = new http.Server(app);

const io = new Server(server, {
    cors: {
        origin: `${env.environment.corsUrl}`,
        methods: ["GET", "POST"]
    }
});

const setupPhaserServer = () => {
    const virtualConsole = new VirtualConsole();
    virtualConsole.sendTo(console, {
        omitJSDOMErrors: false
    });
    JSDOM.fromFile(path.join(process.cwd(), 'dist', 'index.html'), {
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: true,
        virtualConsole: virtualConsole
    }).then((dom) => {
        console.debug('Virtual DOM loaded...');
        dom.window.gameServerReady = () => {
            server.listen(8081, function () {
                console.log(`Game Server Listening on ${server.address()?.['port']}`);
            });
            dom.window.io = io;
        };
    }).catch((error) => {
        console.error(error.message);
    });
}
setupPhaserServer();