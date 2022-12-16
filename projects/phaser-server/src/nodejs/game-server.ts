import express from 'express';
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import DataUriParser from 'datauri/parser.js';
import { JSDOM, VirtualConsole } from 'jsdom';
import { Server } from 'socket.io';

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
    private _config: GameServerConfig;
    private _parser: DataUriParser;
    private _app;
    private _server: http.Server;
    private _io: Server;
    
    public readonly html: string;

    public static readonly DEFAULT_CONFIG: GameServerConfig = {
        port: 8081,
        allowedCorsOrigin: '*', // allow all
        scripts: new Array<string>(),
        serverRoot: path.join(process.cwd(), 'dist')
    };

    constructor(config?: GameServerConfig) {
        this._config = {
            ...GameServer.DEFAULT_CONFIG,
            ...config ?? this._loadConfig()
        };
        this._config.serverRoot = this._validateServerRoot(this._config.serverRoot);
        this._config.scripts = this._validateScripts(...this._config.scripts);

        this.html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body></body>
${this._config.scripts.map(s => '<script src="' + s + '"></script>\n')}
</html>`;

        this._parser = new DataUriParser();
        
        this._app = express();
        this._app.use(express.static(this._config.serverRoot));
        this._app.get('/', (req, res) => {
            res.send(this.html);
        });
        this._app.get('/status', (req, res) => {
            res.sendStatus(200);
        });

        this._server = new http.Server(this._app);

        this._io = new Server(this._server, {
            cors: {
                origin: `${this._config.allowedCorsOrigin}`,
                methods: ["GET", "POST"]
            }
        });
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
                maybeExists = path.join(this._config.serverRoot, s);
            }
            if (fs.existsSync(maybeExists)) {
                fullPaths.push(maybeExists);
            } else {
                throw `unable to locate script at: ${maybeExists}`;
            }
        });
        return fullPaths;
    }

    /**
     * loads the `index.html` file specified in the `server.config.json` file
     * or `./dist/index.html` by default which "should" load in any Javascript
     * files required to run the `game-engine` and then starts the ExpressJs
     * server listening on the port specified in the `server.config.json` file
     * or 8081 by default for `socket.io` connections used to send / receive
     * messages to / from game engine clients
     */
    startGameEngine = () => {
        const virtualConsole = new VirtualConsole();
        virtualConsole.sendTo(console, {
            omitJSDOMErrors: false
        });
        
        try {
            const dom = new JSDOM(this.html, {
                runScripts: "dangerously",
                resources: "usable",
                pretendToBeVisual: true,
                virtualConsole: virtualConsole
            });
            console.debug('Virtual DOM loaded...');
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
                this._server.listen(8081, function () {
                    console.info(`Game Server Listening on ${this._server.address()?.['port']}`);
                });
                dom.window.io = this._io;
                dom.window.gameEngineReady = null; // prevent re-entry
            };
        } catch(e) {
            console.error('error starting game-server: ', e);
        }
    }
}