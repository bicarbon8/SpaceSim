import * as Phaser from "phaser";

type SpaceSimServerOptions = {
    debug?: boolean;
    onReady?: () => void;
};

class SpaceSimServer {
    private _game: Phaser.Game;

    constructor(options?: SpaceSimServerOptions) {
        const conf: Phaser.Types.Core.GameConfig = {
            type: Phaser.HEADLESS,
            width: 1,
            height: 1,
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.NONE
            },
            backgroundColor: '#000000',
            parent: 'space-sim-server',
            physics: {
                default: 'arcade',
                arcade: {
                    debug: options?.debug ?? false,
                    gravity: { x: 0, y: 0 },
                }
            },
            scene: {
                preload: this._preload,
                create: this._create,
                update: this._update
            },
            autoFocus: false
        };

        this._game = new Phaser.Game(conf);
    }

    get game(): Phaser.Game {
        return this._game;
    }

    private _preload(): void {

    }

    private _create(): void {
        console.debug('Game Server is ready');
    }

    private _update(): void {

    }
}

const gameServer = new SpaceSimServer({
    debug: false
});
console.info('loaded server file...');