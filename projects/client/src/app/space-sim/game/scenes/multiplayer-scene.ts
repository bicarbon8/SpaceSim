import * as Phaser from "phaser";
import { GameMap, Constants, Helpers, GameMapOptions, SpaceSim, Ship, ShipOptions, RoomPlus, ShipSupplyOptions, AmmoSupply, CoolantSupply, FuelSupply, RepairsSupply, GameStats, GameScoreTracker, Explosion } from "space-sim-server";
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
    private _exploder: Explosion;

    debug: boolean;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);

        this.debug = SpaceSim.debug;

        SpaceSimClient.mode = 'multiplayer';
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
        SpaceSim.map = null;
        SpaceSimClient.player = null;
        SpaceSim.playersMap.clear();
        this._stellarBodies = new Array<StellarBody>();

        this._exploder = new Explosion(this);

        this._playMusic();
        this._getMapFromServer()
            .then(_ => this._createStellarBodiesLayer())
            .then(_ => this._getPlayerFromServer())
            .then(_ => this._setupSupplyEventHandling())
            .then(_ => this.resize())
            .then(_ => {
                SpaceSim.game.scene.start('multiplayer-hud-scene');
                SpaceSim.game.scene.bringToTop('multiplayer-hud-scene');
            });
    }

    update(time: number, delta: number): void {
        try {
            SpaceSim.players().forEach(p => p?.update(time, delta));

            this._stellarBodies.forEach((body) => {
                body?.update(time, delta);
            });
        } catch (e) {
            /* ignore */
        }
    }

    resize(): void {
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;
        this._createBackground();
        this._setupCamera();
    }

    private _setupSupplyEventHandling(): void {
        SpaceSimClient.socket
            .on(Constants.Socket.UPDATE_SUPPLIES, (supplyOpts: Array<ShipSupplyOptions>) => {
                supplyOpts.forEach(o => {
                    let supply = SpaceSim.suppliesMap.get(o.id);
                    if (supply) {
                        // update existing supply
                        supply?.configure(o);
                    } else {
                        // or create new ship if doesn't already exist
                        switch (o.supplyType) {
                            case 'ammo':
                                supply = new AmmoSupply(this, o);
                                break;
                            case 'coolant':
                                supply = new CoolantSupply(this, o);
                                break;
                            case 'fuel':
                                supply = new FuelSupply(this, o);
                                break;
                            case 'repairs':
                                supply = new RepairsSupply(this, o);
                                break;
                            default:
                                console.warn(`unknown supplyType of ${o.supplyType} provided`);
                                break;
                        }
                        SpaceSim.suppliesMap.set(o.id, supply);
                        this.physics.add.collider(supply, SpaceSim.map.getGameObject());
                    }
                });
            }).on(Constants.Socket.REMOVE_SUPPLY, (id) => {
                const supply = SpaceSim.suppliesMap.get(id);
                if (supply) {
                    supply.destroy();
                    SpaceSim.suppliesMap.delete(id);
                }
            }).on(Constants.Socket.UPDATE_STATS, (stats: Array<Partial<GameStats>>) => {
                GameScoreTracker.updateAllStats(...stats);
            });;
    }

    private _turnOffSocketEventHandling(): void {
        SpaceSimClient.socket
            .off(Constants.Socket.UPDATE_MAP)
            .off(Constants.Socket.PLAYER_DEATH)
            .off(Constants.Socket.UPDATE_PLAYERS)
            .off(Constants.Socket.TRIGGER_ENGINE)
            .off(Constants.Socket.TRIGGER_WEAPON)
            .off(Constants.Socket.UPDATE_SUPPLIES)
            .off(Constants.Socket.REMOVE_SUPPLY)
            .off(Constants.Socket.UPDATE_STATS);
    }

    private async _getMapFromServer(): Promise<void> {
        SpaceSimClient.socket
            .on(Constants.Socket.UPDATE_MAP, (opts: GameMapOptions) => {
                SpaceSim.map = new GameMap(this, opts);
                // ensure all tiles are visible (defaults to hidden)
                SpaceSim.map.getLayer().forEachTile(tile => tile.setAlpha(1));
            });
        SpaceSimClient.socket.emit(Constants.Socket.REQUEST_MAP);
        await this._waitForMap();
    }

    private async _waitForMap(): Promise<void> {
        while (SpaceSim.map == null) {
            // wait half a second and check again
            await new Promise<void>(resolve => setTimeout(resolve, 500));
        }
    }

    private async _getPlayerFromServer(): Promise<void> {
        SpaceSimClient.socket.on(Constants.Socket.UPDATE_PLAYERS, (shipOpts: Array<ShipOptions>) => {
            shipOpts.forEach(o => {
                let ship = SpaceSim.playersMap.get(o.id);
                if (ship) {
                    // update existing ship
                    ship?.configure(o);
                } else {
                    // or create new ship if doesn't already exist
                    ship = new Ship(this, {
                        ...o,
                        weaponsKey: Phaser.Math.RND.between(1, 3),
                        wingsKey: Phaser.Math.RND.between(1, 3),
                        cockpitKey: Phaser.Math.RND.between(1, 3),
                        engineKey: Phaser.Math.RND.between(1, 3)
                    });
                    SpaceSim.playersMap.set(o.id, ship);
                    this.physics.add.collider(ship.getGameObject(), SpaceSim.map.getGameObject());
                    this._addPlayerCollisionPhysicsWithPlayers(ship);
                }

                if (ship?.id === SpaceSimClient.socket.id) {
                    SpaceSimClient.player = ship;
                }
            });
        }).on(Constants.Socket.PLAYER_DEATH, (id: string) => {
            const ship = SpaceSim.playersMap.get(id);
            if (ship) {
                this._exploder.explode({location: ship.config.location});
                ship?.destroy();
                SpaceSim.playersMap.delete(ship.id);
            }
        });

        // setup listener for player death event
        this.events.on(Constants.Events.PLAYER_DEATH, (shipOpts: ShipOptions) => {
            if (SpaceSimClient.player.id == shipOpts?.id) {
                this._turnOffSocketEventHandling();
                SpaceSimClient.socket?.emit(Constants.Socket.PLAYER_DEATH);
                this.cameras.main.fadeOut(2000, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                    if (progress === 1) {
                        this.game.scene.start('game-over-scene');
                        this.game.scene.stop('multiplayer-hud-scene');
                        this.game.scene.stop(this);
                    }
                });
            }
        });

        SpaceSimClient.socket.emit(Constants.Socket.REQUEST_PLAYER, SpaceSimClient.playerData);
        await this._waitForPlayer();
    }

    private async _waitForPlayer(): Promise<void> {
        while (SpaceSimClient.player == null) {
            // wait half a second and check again
            await new Promise<void>(resolve => setTimeout(resolve, 500));
        }
    }

    private _createStellarBodiesLayer(): void {
        const room: RoomPlus = SpaceSim.map.getRooms()[0];
        const bodies: StellarBodyOptions[] = [
            {spriteName: 'sun'}, 
            {spriteName: 'venus', rotationSpeed: 0}, 
            {spriteName: 'mercury', rotationSpeed: 0},
            {spriteName: 'asteroids', scale: {min: 4, max: 10}}
        ];
        const topleft: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.left, room.top);
        const botright: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.right, room.bottom);
        const offsetX = 300;
        const offsetY = 300;
        const divisionsX = Math.floor(Phaser.Math.Distance.BetweenPoints({x: topleft.x, y: 0}, {x: botright.x, y: 0}) / offsetX);
        const divisionsY = Math.floor(Phaser.Math.Distance.BetweenPoints({x: 0, y: topleft.y}, {x: 0, y: botright.y}) / offsetY);
        let x: number = topleft.x;
        let y: number = topleft.y;
        for (var i=0; i<divisionsX; i++) {
            for (var j=0; j<divisionsY; j++) {
                let location: Phaser.Math.Vector2 = Helpers.vector2(
                    Phaser.Math.RND.realInRange(x, x + offsetX), 
                    Phaser.Math.RND.realInRange(y, y + offsetY)
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

                y += offsetY;
            }
            x += offsetX;
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

    private async _setupCamera(): Promise<void> {
        await this._waitForPlayer();
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

    private _addPlayerCollisionPhysicsWithPlayers(ship: Ship): void {
        this.physics.add.collider(ship.getGameObject(), SpaceSim.players().map(p => p?.getGameObject()));
    }
}