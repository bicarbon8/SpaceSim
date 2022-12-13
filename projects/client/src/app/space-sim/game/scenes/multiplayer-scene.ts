import * as Phaser from "phaser";
import { GameMap, Constants, Helpers, GameScoreTracker, GameMapOptions, SpaceSim, ShipLike } from "space-sim-server";
import { StellarBody } from "../star-systems/stellar-body";
import { environment } from "../../../../environments/environment";
import { SpaceSimClient } from "../space-sim-client";
import { StellarBodyOptions } from "../star-systems/stellar-body-options";
import { Resizable } from "../interfaces/resizable";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'multiplayer-scene'
};

export class MultiplayerScene extends Phaser.Scene implements Resizable {
    private _width: number;
    private _height: number;
    private _stellarBodies: StellarBody[];
    private _backgroundStars: Phaser.GameObjects.TileSprite;
    private _music: Phaser.Sound.BaseSound;

    debug: boolean;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);

        this.debug = SpaceSim.debug;
        this._stellarBodies = [];
    }

    preload(): void {
        this.load.image('weapons-1', `${environment.baseUrl}/assets/sprites/ship-parts/weapons-1.png`);
        this.load.image('weapons-2', `${environment.baseUrl}/assets/sprites/ship-parts/weapons-2.png`);
        this.load.image('weapons-3', `${environment.baseUrl}/assets/sprites/ship-parts/weapons-3.png`);
        this.load.image('wings-1', `${environment.baseUrl}/assets/sprites/ship-parts/wings-1.png`);
        this.load.image('wings-2', `${environment.baseUrl}/assets/sprites/ship-parts/wings-2.png`);
        this.load.image('wings-3', `${environment.baseUrl}/assets/sprites/ship-parts/wings-3.png`);
        this.load.image('cockpit-1', `${environment.baseUrl}/assets/sprites/ship-parts/cockpit-1.png`);
        this.load.image('cockpit-2', `${environment.baseUrl}/assets/sprites/ship-parts/cockpit-2.png`);
        this.load.image('cockpit-3', `${environment.baseUrl}/assets/sprites/ship-parts/cockpit-3.png`);
        this.load.image('engine-1', `${environment.baseUrl}/assets/sprites/ship-parts/engine-1.png`);
        this.load.image('engine-2', `${environment.baseUrl}/assets/sprites/ship-parts/engine-2.png`);
        this.load.image('engine-3', `${environment.baseUrl}/assets/sprites/ship-parts/engine-3.png`);

        this.load.image('overheat-glow', `${environment.baseUrl}/assets/particles/red-glow.png`);
        this.load.spritesheet('flares', `${environment.baseUrl}/assets/particles/flares.png`, {
            frameWidth: 130,
            frameHeight: 132,
            startFrame: 0,
            endFrame: 4
        });
        this.load.spritesheet('asteroids', `${environment.baseUrl}/assets/tiles/asteroids-tile.png`, {
            frameWidth: 100,
            frameHeight: 100,
            startFrame: 0,
            endFrame: 63,
            margin: 14,
            spacing: 28
        });
        
        this.load.image('explosion', `${environment.baseUrl}/assets/particles/explosion.png`);
        this.load.image('bullet', `${environment.baseUrl}/assets/sprites/bullet.png`);
        this.load.image('ammo', `${environment.baseUrl}/assets/sprites/ammo.png`);
        this.load.image('fuel-canister', `${environment.baseUrl}/assets/sprites/fuel-canister.png`);
        this.load.image('coolant-canister', `${environment.baseUrl}/assets/sprites/coolant-canister.png`);
        this.load.image('repairs-canister', `${environment.baseUrl}/assets/sprites/repairs-canister.png`);

        this.load.image('sun', `${environment.baseUrl}/assets/backgrounds/sun.png`);
        this.load.image('venus', `${environment.baseUrl}/assets/backgrounds/venus.png`);
        this.load.image('mercury', `${environment.baseUrl}/assets/backgrounds/mercury.png`);

        this.load.image('far-stars', `${environment.baseUrl}/assets/backgrounds/starfield-tile-512x512.png`);

        this.load.image('metaltiles', `${environment.baseUrl}/assets/tiles/metaltiles_lg.png`);
        
        this.load.audio('background-music', `${environment.baseUrl}/assets/audio/space-marine-theme.ogg`);
        this.load.audio('thruster-fire', `${environment.baseUrl}/assets/audio/effects/thrusters.wav`);
        this.load.audio('booster-fire', `${environment.baseUrl}/assets/audio/effects/booster-fire.ogg`);
        this.load.audio('cannon-fire', `${environment.baseUrl}/assets/audio/effects/cannon-fire.ogg`);
        this.load.audio('bullet-hit', `${environment.baseUrl}/assets/audio/effects/bullet-hit.ogg`);
        this.load.audio('explosion', `${environment.baseUrl}/assets/audio/effects/ship-explosion.ogg`);
    }

    create(): void {
        this._getMapFromServer();
        this._getPlayerFromServer();
        this.resize();
        this._createStellarBodiesLayer();
        this._createBackground();
        this._playMusic();

        SpaceSim.game.scene.start('multiplayer-hud-scene');
        SpaceSim.game.scene.bringToTop('multiplayer-hud-scene');
    }

    resize(): void {
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;
        this._createBackground();
        this._setupCamera();
    }

    update(time: number, delta: number): void {
        try {
            SpaceSim.players.forEach(p => p?.update(time, delta));

            this._stellarBodies.forEach((body) => {
                body.update(time, delta);
            });
        } catch (e) {
            /* ignore */
        }
    }

    private _getMapFromServer(): void {
        SpaceSimClient.socket.emit(Constants.Socket.REQUEST_MAP);
        SpaceSimClient.socket.on(Constants.Socket.UPDATE_MAP, (opts: GameMapOptions) => {
            SpaceSim.map = new GameMap(this, opts);
            if (!SpaceSimClient.player) {
                this._getPlayerFromServer();
            }
        });
    }

    private _getPlayerFromServer(): void {
        SpaceSimClient.socket.emit(Constants.Socket.REQUEST_PLAYER);
        SpaceSimClient.socket.on(Constants.Socket.UPDATE_PLAYERS, (players: Array<ShipLike>) => {
            if (!SpaceSimClient.player) {
                SpaceSimClient.player = players.find(p => p.id === SpaceSimClient.socket.id);
                this.physics.add.collider(SpaceSimClient.player.getGameObject(), SpaceSim.map.getGameObject());
            }
            SpaceSim.players.splice(0, SpaceSim.players.length, ...players);
        });

        // setup listener for player death event
        this.events.on(Constants.Events.PLAYER_DEATH, (ship: ShipLike) => {
            if (SpaceSimClient.player.id == ship?.id) {
                this.cameras.main.fadeOut(2000, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                    if (progress === 1) {
                        this.game.scene.start('game-over-scene');
                        this.game.scene.stop('multiplayer-hud-scene');
                        this.game.scene.stop(this);
                    }
                });
            } else {
                // TODO: remove opponent from SpaceSim.opponents array
                GameScoreTracker.opponentDestroyed();
            }
        });
    }

    private _createStellarBodiesLayer(): void {
        let rooms = SpaceSim.map.getRooms();
        let bodies: StellarBodyOptions[] = [
            {spriteName: 'sun'}, 
            {spriteName: 'venus', rotationSpeed: 0}, 
            {spriteName: 'mercury', rotationSpeed: 0},
            {spriteName: 'asteroids', scale: {min: 4, max: 10}}
        ];
        for (var i=0; i<rooms.length; i++) {
            let room = rooms[i];
            let startTopLeft: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.left, room.top);
            let startBottomRight: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.right, room.bottom);
            let location: Phaser.Math.Vector2 = Helpers.vector2(
                Phaser.Math.RND.realInRange(startTopLeft.x, startBottomRight.x), 
                Phaser.Math.RND.realInRange(startTopLeft.y, startBottomRight.y)
            );
            let opts: StellarBodyOptions;
            if (i%3 === 0) {
                opts = bodies[Phaser.Math.RND.between(0, 2)];
            } else {
                opts = bodies[3];
            }
            opts.location = location;
            let body = new StellarBody(this, opts);
            this._stellarBodies.push(body);
        }
    }

    private _createBackground(): void {
        if (this._backgroundStars) {
            this._backgroundStars.destroy();
        }
        this._backgroundStars = this.add.tileSprite(this._width/2, this._height/2, this._width*3, this._height*3, 'far-stars');
        this._backgroundStars.setDepth(Constants.UI.Layers.BACKGROUND);
        this._backgroundStars.setScrollFactor(0.01); // slight movement to appear very far away
    }

    private _setupCamera(): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 0, g: 0, b: 0});
        
        let zoom = 0.75;
        if (this._width < 400 || this._height < 400) {
            zoom = 0.5;
        }
        this.cameras.main.setZoom(zoom);
        let playerLoc = SpaceSimClient.player.getLocation();
        this.cameras.main.centerOn(playerLoc.x, playerLoc.y);

        this.cameras.main.startFollow(SpaceSimClient.player.getGameObject(), true, 1, 1);
    }

    private _playMusic(): void {
        this._music = this.sound.add('background-music', {loop: true, volume: 0.1});
        this._music.play();
        this.events.on(Phaser.Scenes.Events.PAUSE, () => this._music.pause());
        this.events.on(Phaser.Scenes.Events.RESUME, () => this._music.resume());
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this._music.stop());
        this.events.on(Phaser.Scenes.Events.DESTROY, () => this._music.destroy());
    }
}