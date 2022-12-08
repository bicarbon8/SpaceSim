import express from 'express';
import * as http from 'http';
import * as path from 'path';
import { JSDOM, VirtualConsole } from 'jsdom';
import { Server } from 'socket.io';

const app = express();
app.use(express.static(path.join(process.cwd(), 'dist')));
app.get('/', function (req, res) {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

const server = new http.Server(app);

const io = new Server(server);

const setupAuthoritativePhaser = () => {
    const virtualConsole = new VirtualConsole();
    virtualConsole.sendTo(console, {
        omitJSDOMErrors: false
    });
    JSDOM.fromFile(path.join(process.cwd(), 'dist', 'index.html'), {
        // To run the scripts in the html file
        runScripts: "dangerously",
        // Also load supported external resources
        resources: "usable",
        // So requestAnimatinFrame events fire
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
setupAuthoritativePhaser();