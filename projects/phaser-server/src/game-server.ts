import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import { JSDOM, VirtualConsole } from 'jsdom';
import { Server } from 'socket.io';

const express = require('express');
const datauri = require('datauri/parser');

export type GameServerConfig = {
    /**
     * port the server will listen for requests on
     * 
     * defaults to 8081
     */
    port?: number;
    /**
     * set this to the domain from which requests will
     * arrive to this server to restrict to only that
     * handling requests from that domain
     * 
     * defaults to '*'
     */
    allowedCorsOrigin?: string;
    /**
     * an array of paths relative to the `serverRoot` used
     * to load the javascript files containing the `GameEngine`
     * and it's dependencies
     * 
     * NOTE: Ecmascript modules are **NOT** supported
     */
    scripts?: Array<string>;
    /**
     * the location to serve any static content such as
     * images from
     * 
     * defaults to `process.cwd()/dist`
     */
    serverRoot?: string;
};

export class GameServer {
    private _parser: any;
    private _app;
    private _server: http.Server;
    private _io: Server;

    public readonly port: number;
    public readonly allowedCorsOrigin: string;
    public readonly scripts: Array<string>;
    public readonly serverRoot: string;
    
    public readonly html: string;
    public readonly index: string;

    public static readonly DEFAULT_CONFIG: GameServerConfig = {
        port: 8081,
        allowedCorsOrigin: '*', // allow all
        scripts: new Array<string>(),
        serverRoot: path.join(process.cwd(), 'dist')
    };

    constructor(config?: GameServerConfig) {
        config = {
            ...GameServer.DEFAULT_CONFIG,
            ...config ?? this._loadConfig()
        };

        this.port = config.port;
        this.allowedCorsOrigin = config.allowedCorsOrigin;
        this.serverRoot = this._validateServerRoot(config.serverRoot);
        this.scripts = this._validateScripts(...config.scripts);

        this.html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
${this.scripts.map(s => '<script defer="defer" src="' + s + '"></script>').join('\n')}
</head>
<body />
</html>`;
        this.index = path.join(this.serverRoot, 'index.html');
        fs.writeFileSync(this.index, this.html);

        this._parser = new datauri();
        
        this._app = express();
        this._app.use(express.static(this.serverRoot));
        this._app.get('/', (req, res) => {
            res.send(this.index);
        });
        this._app.get('/status', (req, res) => {
            res.sendStatus(200);
        });

        this._server = http.createServer(this._app);

        this._io = new Server(this._server, {
            cors: {
                origin: `${this.allowedCorsOrigin}`,
                methods: ["GET", "POST"]
            }
        });
    }

    /**
     * loads the virtual DOM hosting the game-engine scripts and starts the ExpressJs
     * server listening on the port specified in the `server.config.json` file
     * or 8081 by default for `socket.io` connections used to send / receive
     * messages to / from game engine clients
     */
    startGameEngine(): void {
        const virtualConsole = new VirtualConsole();
        virtualConsole.sendTo(console, {
            omitJSDOMErrors: false
        });
        
        try {
            JSDOM.fromFile(this.index, {
                runScripts: "dangerously",
                resources: "usable",
                pretendToBeVisual: true,
                virtualConsole: virtualConsole
            }).then(dom => {
                console.debug('Virtual DOM loaded...', dom.serialize());
                dom.window.URL.createObjectURL = (blob: Blob) => {
                    if (blob){
                        return this._parser.format(
                            blob.type, 
                            blob[Object.getOwnPropertySymbols(blob)[0]]._buffer
                        ).content ?? '';
                    }
                    return '';
                };
                dom.window.URL.revokeObjectURL = (objectURL) => {};
                dom.window.gameEngineReady = () => {
                    console.debug('Game Engine is ready');
                    this._server.listen(8081, () => {
                        console.info(`Game Server Listening on ${this._server.address()?.['port']}`);
                    });
                    dom.window.io = this._io;
                    dom.window.gameEngineReady = null; // prevent re-entry
                };
            });
        } catch(e) {
            console.error('error starting game-server: ', e);
        }
    }

    private _loadConfig(): GameServerConfig {
        let config: GameServerConfig = {};
        const configPath = path.join(process.cwd(), 'server.config.json');
        if (fs.existsSync(configPath)) {
            try {
                const file = fs.readFileSync(configPath, {encoding: 'utf-8'});
                const parsed = JSON.parse(file);
                config = parsed;
            } catch (e) {
                console.warn('unable to load configuration due to:', e);
            }
        }
        return config;
    }

    private _validateServerRoot(serverRoot: string): string {
        let absoluteRoot: string;
        if (path.isAbsolute(serverRoot)) {
            absoluteRoot = serverRoot;
        } else {
            absoluteRoot = path.join(process.cwd(), serverRoot);
        }
        if (!fs.existsSync(absoluteRoot)) {
            throw `specified 'serverRoot' of '${absoluteRoot}' could not be found`;
        }

        return absoluteRoot;
    }

    private _validateScripts(...scripts: Array<string>): Array<string> {
        const fullPaths = new Array<string>();
        scripts.forEach(s => {
            let maybeExists: string;
            if (path.isAbsolute(s)) {
                maybeExists = s;
            } else {
                maybeExists = path.join(this.serverRoot, s);
            }
            if (fs.existsSync(maybeExists)) {
                fullPaths.push(s);
            } else {
                throw `unable to locate script at: ${maybeExists}`;
            }
        });
        return fullPaths;
    }
}