import * as Phaser from "phaser";
import { GameLevel, Constants, Helpers, GameLevelOptions, SpaceSim, Ship, ShipOptions, RoomPlus, ShipSupplyOptions, GameStats, GameScoreTracker, Exploder, BaseScene, ShipSupply } from "space-sim-shared";
import { StellarBody } from "../star-systems/stellar-body";
import { environment } from "../../../../environments/environment";
import { SpaceSimClient } from "../space-sim-client";
import { StellarBodyOptions } from "../star-systems/stellar-body";
import { Resizable } from "../interfaces/resizable";
import { Camera } from "../ui-components/camera";
import { Radar } from "../ui-components/radar";
import { PlayerShip } from "../ships/player-ship";
import { PlayerAmmoSupply } from "../ships/supplies/player-ammo-supply";
import { PlayerCoolantSupply } from "../ships/supplies/player-coolant-supply";
import { PlayerFuelSupply } from "../ships/supplies/player-fuel-supply";
import { PlayerRepairsSupply } from "../ships/supplies/player-repairs-supply";
import { Animations } from "../utilities/animations";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'multiplayer-scene'
};

export class MultiplayerScene extends BaseScene implements Resizable {
    private _width: number;
    private _height: number;
    private _stellarBodies: StellarBody[];
    private _backgroundStars: Phaser.GameObjects.TileSprite;
    private _music: Phaser.Sound.BaseSound;
    private _exploder: Exploder;
    private _shipId: string;
    private _disconnectTimer: number;
    private _gameLevel: GameLevel;
    private readonly _supplies = new Map<string, ShipSupply>();
    private readonly _ships = new Map<string, Ship>();

    debug: boolean;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);

        this.debug = SpaceSim.debug;
    }

    override getLevel<T extends GameLevel>(): T {
        return this._gameLevel as T;
    }

    override getShipsMap<T extends Ship>(): Map<string, T> {
        return this._ships as Map<string, T>;
    }

    override getShips<T extends Ship>(): Array<T> {
        return Array.from(this._ships.values()) as Array<T>;
    }

    override getSuppliesMap<T extends ShipSupply>(): Map<string, T> {
        return this._supplies as Map<string, T>;
    }

    override getSupplies<T extends ShipSupply>(): Array<T> {
        return Array.from(this._supplies.values()) as Array<T>;
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
        this.load.image('minimap-player', `${environment.baseUrl}/assets/sprites/minimap-player.png`);

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
        this.load.image('minimaptile', `${environment.baseUrl}/assets/tiles/minimap-tile.png`);
        
        this.load.audio('background-music', `${environment.baseUrl}/assets/audio/space-marine-theme.ogg`);
        this.load.audio('thruster-fire', `${environment.baseUrl}/assets/audio/effects/thrusters.wav`);
        this.load.audio('booster-fire', `${environment.baseUrl}/assets/audio/effects/booster-fire.ogg`);
        this.load.audio('cannon-fire', `${environment.baseUrl}/assets/audio/effects/cannon-fire.ogg`);
        this.load.audio('bullet-hit', `${environment.baseUrl}/assets/audio/effects/bullet-hit.ogg`);
        this.load.audio('explosion', `${environment.baseUrl}/assets/audio/effects/ship-explosion.ogg`);
    }

    create(): void {
        SpaceSimClient.mode = 'multiplayer';
        this._shipId = null;
        this._gameLevel = null;
        SpaceSimClient.player = null;
        this._ships.clear();
        this._supplies.clear();
        this._stellarBodies = new Array<StellarBody>();

        this._exploder = new Exploder(this);

        this._setupSocketEventHandling();

        // disable camera until we have our ship
        this.cameras.main.fadeOut(0, 0, 0, 0);

        this._playMusic();

        this._getMapFromServer()
            .then(_ => this._createStellarBodiesLayer())
            .then(_ => this._getPlayerFromServer())
            .then(_ => this.resize())
            .then(_ => {
                SpaceSim.game.scene.start('multiplayer-hud-scene');
                SpaceSim.game.scene.bringToTop('multiplayer-hud-scene');
            });
    }

    update(time: number, delta: number): void {
        try {
            this.getShips().forEach(p => p?.update(time, delta));

            this._stellarBodies.forEach((body) => {
                body?.update(time, delta);
            });

            if (!SpaceSimClient.socket?.connected) {
                if (this._disconnectTimer == null) {
                    this._disconnectTimer = window.setTimeout(() => this._gameOver(), 10000);
                }
            } else {
                if (this._disconnectTimer != null) {
                    window.clearTimeout(this._disconnectTimer);
                    this._disconnectTimer = null;
                }
            }
        } catch (e) {
            /* ignore */
        }
    }

    resize(): void {
        this._width = this.game.scale.displaySize.width;
        this._height = this.game.scale.displaySize.height;
        this._createBackground();
        this._setupCamera();
        this._setupMiniMap();
    }

    private _setupSocketEventHandling(): void {
        SpaceSimClient.socket
            .on(Constants.Socket.UPDATE_SUPPLIES, (opts: Array<ShipSupplyOptions>) => this._handleUpdateSuppliesEvent(opts))
            .on(Constants.Socket.REMOVE_SUPPLY, (id: string) => this._handleRemoveSupplyEvent(id))
            .on(Constants.Socket.FLICKER_SUPPLY, (id: string) => this._handleFlickerSupplyEvent(id))
            .on(Constants.Socket.UPDATE_PLAYERS, (opts: Array<ShipOptions>) => this._handleUpdatePlayersEvent(opts))
            .on(Constants.Socket.PLAYER_DEATH, (id?: string) => this._handlePlayerDeathEvent(id))
            .on(Constants.Socket.UPDATE_STATS, (stats: Array<Partial<GameStats>>) => GameScoreTracker.updateAllStats(...stats))
            .on(Constants.Socket.TRIGGER_ENGINE, (id) => {
                this._ships.get(id)?.getThruster()?.trigger();
            }).on(Constants.Socket.TRIGGER_WEAPON, (id) => {
                this._ships.get(id)?.getWeapons()?.trigger();
            }).on(Constants.Socket.UPDATE_MAP, (opts: GameLevelOptions) => {
                this._gameLevel = new GameLevel(this, opts);
            }).on(Constants.Socket.SET_PLAYER_ID, (id: string) => {
                this._shipId = id;
            });
    }

    private _handleUpdateSuppliesEvent(opts: Array<ShipSupplyOptions>): void {
        Helpers.trycatch(() => {
            opts.forEach(o => {
                let supply = this._supplies.get(o.id);
                if (supply) {
                    // update existing supply
                    supply?.configure(o);
                } else {
                    // or create new ship if doesn't already exist
                    switch (o.supplyType) {
                        case 'ammo':
                            supply = new PlayerAmmoSupply(this, o);
                            break;
                        case 'coolant':
                            supply = new PlayerCoolantSupply(this, o);
                            break;
                        case 'fuel':
                            supply = new PlayerFuelSupply(this, o);
                            break;
                        case 'repairs':
                            supply = new PlayerRepairsSupply(this, o);
                            break;
                        default:
                            console.warn(`unknown supplyType of ${o.supplyType} provided`);
                            break;
                    }
                    this._supplies.set(o.id, supply);
                    Helpers.trycatch(() => SpaceSimClient.radar?.ignore(supply), 'none');
                }
            });
        }, 'debug', `error in handling ${Constants.Socket.UPDATE_SUPPLIES} event`, 'message');
    }

    private _handleRemoveSupplyEvent(id: string): void {
        const supply = this._supplies.get(id);
        if (supply) {
            supply.destroy();
            this._supplies.delete(id);
        }
    }

    private _handleFlickerSupplyEvent(id: string): void {
        const supply = this._supplies.get(id);
        if (supply) {
            Animations.flicker(supply, -1, () => null);
        }
    }

    private _handleUpdatePlayersEvent(opts: Array<ShipOptions>): void {
        Helpers.trycatch(() => {
            opts.forEach(o => {
                let ship = this._ships.get(o.id) as PlayerShip;
                if (ship) {
                    // update existing ship
                    ship?.configure(o);
                } else {
                    // or create new ship if doesn't already exist
                    ship = new PlayerShip(this, o);
                    this._ships.set(o.id, ship);
                    this.physics.add.collider(ship.getGameObject(), this.getLevel().getGameObject());
                    this._addPlayerCollisionPhysicsWithPlayers(ship);
                    Helpers.trycatch(() => SpaceSimClient.camera?.ignore(ship.radarSprite), 'none');
                }

                if (ship?.id === this._shipId) {
                    SpaceSimClient.player = ship;
                }
            });
        }, 'debug', `error in handling ${Constants.Socket.UPDATE_PLAYERS} event`, 'message');
    }

    private _handlePlayerDeathEvent(id?: string): void {
        Helpers.trycatch(() => {
            if (!id || SpaceSimClient.player.id === id) {
                this._gameOver();
            } else {
                const ship = this._ships.get(id);
                if (ship) {
                    this._exploder.explode({location: ship.config.location});
                    ship?.destroy(false);
                    this._ships.delete(ship.id);
                }
            }
        }, 'debug', `error in handling ${Constants.Socket.PLAYER_DEATH} event`, 'message');
    }

    private _turnOffSocketEventHandling(): void {
        SpaceSimClient.socket
            .removeAllListeners(Constants.Socket.UPDATE_MAP)
            .removeAllListeners(Constants.Socket.PLAYER_DEATH)
            .removeAllListeners(Constants.Socket.UPDATE_PLAYERS)
            .removeAllListeners(Constants.Socket.TRIGGER_ENGINE)
            .removeAllListeners(Constants.Socket.TRIGGER_WEAPON)
            .removeAllListeners(Constants.Socket.UPDATE_SUPPLIES)
            .removeAllListeners(Constants.Socket.REMOVE_SUPPLY)
            .removeAllListeners(Constants.Socket.UPDATE_STATS);
    }

    private async _getMapFromServer(): Promise<void> {
        SpaceSimClient.socket.emit(Constants.Socket.REQUEST_MAP, SpaceSimClient.playerData);
        await this._waitForMap();
    }

    private async _waitForMap(): Promise<void> {
        while (this.getLevel() == null) {
            // wait half a second and check again
            await new Promise<void>(resolve => setTimeout(resolve, 500));
        }
    }

    private async _getPlayerFromServer(): Promise<void> {
        // handle case of client self destruct by notifying server of our destruction
        this.events.on(Constants.Events.PLAYER_DEATH, (shipOpts: ShipOptions) => {
            if (shipOpts.id === SpaceSimClient.player.id) {
                SpaceSimClient.socket?.emit(Constants.Socket.PLAYER_DEATH, SpaceSimClient.playerData);
            }
        });

        SpaceSimClient.socket.emit(Constants.Socket.REQUEST_SHIP, SpaceSimClient.playerData);
        await this._waitForPlayer();
    }

    private async _waitForPlayer(): Promise<void> {
        while (SpaceSimClient.player == null) {
            // wait half a second and check again
            await new Promise<void>(resolve => setTimeout(resolve, 500));
        }
    }

    private _createStellarBodiesLayer(): void {
        const room: RoomPlus = this.getLevel().getRooms()[0];
        const bodies: StellarBodyOptions[] = [
            {spriteName: 'sun'}, 
            {spriteName: 'venus', rotationSpeed: 0}, 
            {spriteName: 'mercury', rotationSpeed: 0},
            {spriteName: 'asteroids', scale: {min: 4, max: 10}}
        ];
        const topleft: Phaser.Math.Vector2 = this.getLevel().getMapTileWorldLocation(room.left, room.top);
        const botright: Phaser.Math.Vector2 = this.getLevel().getMapTileWorldLocation(room.right, room.bottom);
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
        await this._waitForMap();
        await this._waitForPlayer();

        let zoom = 1;
        if (this._width < 400 || this._height < 400) {
            zoom = 0.5;
        }
        if (SpaceSimClient.camera) {
            SpaceSimClient.camera.destroy();
        }
        SpaceSimClient.camera = new Camera(this, {
            name: 'main',
            zoom: zoom,
            ignore: [
                this.getLevel().minimapLayer,
                ...this.getShips<PlayerShip>()
                    .map(p => p.radarSprite)
                    .filter(p => p != null)
            ],
            backgroundColor: 0x000000,
            followObject: SpaceSimClient.player.getGameObject()
        });
        SpaceSimClient.camera.cam.fadeIn(1000, 0, 0, 0);
    }

    private async _setupMiniMap(): Promise<void> {
        await this._waitForMap();
        await this._waitForPlayer();
        
        const miniWidth = this._width / 4;
        const miniHeight = this._height / 4;
        let miniSize = (miniWidth < miniHeight) ? miniWidth : miniHeight;
        if (miniSize < 150) {
            miniSize = 150;
        }
        if (SpaceSimClient.radar) {
            SpaceSimClient.radar.destroy();
        }
        SpaceSimClient.radar = new Radar(this, {
            x: this._width - ((miniSize / 2) + 10),
            y: miniSize,
            width: miniSize,
            height: miniSize,
            ignore: [
                this._backgroundStars, 
                ...this._stellarBodies.map(b => b.getGameObject()),
                this.getLevel().getGameObject()
            ],
            followObject: SpaceSimClient.player.getGameObject()
        });
    }

    private _playMusic(): void {
        Helpers.trycatch(() => this._music = this.sound.add('background-music', {loop: true, volume: 0.1}));
        this._music?.play();
        this.events.on(Phaser.Scenes.Events.PAUSE, () => this._music?.pause());
        this.events.on(Phaser.Scenes.Events.RESUME, () => this._music?.resume());
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this._music?.stop());
        this.events.on(Phaser.Scenes.Events.DESTROY, () => this._music?.destroy());
    }

    private _addPlayerCollisionPhysicsWithPlayers(ship: Ship): void {
        this.physics.add.collider(ship.getGameObject(), this.getShips().map(p => p?.getGameObject()));
    }

    private _gameOver(): void {
        this._turnOffSocketEventHandling();
        SpaceSimClient.camera.cam.fadeOut(2000, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
            if (progress === 1) {
                this.game.scene.start('game-over-scene');
                this.game.scene.stop('multiplayer-hud-scene');
                this.game.scene.stop(this);
            }
        });
    }
}