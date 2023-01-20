import * as Phaser from "phaser";
import { GameLevel, Constants, Helpers, GameLevelOptions, SpaceSim, Ship, RoomPlus, ShipSupplyOptions, BaseScene, ShipSupply, ShipConfig } from "space-sim-shared";
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
import { Animations } from "../ui-components/animations";
import { MultiplayerHudSceneConfig } from "./multiplayer-hud-scene";
import { GameOverSceneConfig } from "./game-over-scene";
import { UiExploder } from "../ui-components/ui-exploder";
import { PlayerBullet } from "../ships/attachments/offence/player-bullet";
import { PlayerEngine } from "../ships/attachments/utility/player-engine";
import { PlayerMachineGun } from "../ships/attachments/offence/player-machine-gun";
import { ClientGameLevel } from "../levels/client-game-level";

export const MultiplayerSceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'multiplayer-scene'
} as const;

export class MultiplayerScene extends BaseScene implements Resizable {
    private _width: number;
    private _height: number;
    private _stellarBodies: StellarBody[];
    private _backgroundStars: Phaser.GameObjects.TileSprite;
    private _music: Phaser.Sound.BaseSound;
    private _exploder: UiExploder;
    private _disconnectTimer: number;
    private _gameLevel: ClientGameLevel;
    private readonly _supplies = new Map<string, ShipSupply>();
    private readonly _ships = new Map<string, Ship>();
    private _camera: Camera;
    private _radar: Radar;

    debug: boolean;

    private _shouldGetMap = false;
    private _shouldCreateStellarBodies = false;
    private _shouldGetPlayer = false;
    private _needsResize = false;
    private _shouldResize = false;
    private _shouldShowHud = false;
    private _shouldEndScene = false;

    private readonly _updateShipsQueue = new Array<ShipConfig>();
    private readonly _removeShipsQueue = new Array<string>();
    private readonly _updateSuppliesQueue = new Array<ShipSupplyOptions>();
    private readonly _flickerSuppliesQueue = new Array<string>();
    private readonly _removeSuppliesQueue = new Array<string>();

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || MultiplayerSceneConfig);

        this.debug = SpaceSim.debug;
    }

    override getLevel<T extends GameLevel>(): T {
        return this._gameLevel as T;
    }

    override queueGameLevelUpdate<T extends GameLevelOptions>(opts: T): BaseScene {
        if (!this._gameLevel) {
            this._gameLevel = new ClientGameLevel(this, opts);
            this._shouldCreateStellarBodies = true;
            this._shouldGetPlayer = true;
        }
        return this;
    }

    override getShip<T extends Ship>(id: string): T {
        return this._ships.get(id) as T;
    }

    override getShips<T extends Ship>(): Array<T> {
        return Array.from(this._ships.values()) as Array<T>;
    }

    override getSupply<T extends ShipSupply>(id: string): T {
        return this._supplies.get(id) as T;
    }

    override getSupplies<T extends ShipSupply>(): Array<T> {
        return Array.from(this._supplies.values()) as Array<T>;
    }

    preload(): void {
        PlayerShip.preload(this);
        PlayerEngine.preload(this);
        StellarBody.preload(this);
        UiExploder.preload(this);
        PlayerBullet.preload(this);
        PlayerAmmoSupply.preload(this);
        PlayerCoolantSupply.preload(this);
        PlayerFuelSupply.preload(this);
        PlayerRepairsSupply.preload(this);
        ClientGameLevel.preload(this);

        this.load.image('far-stars', `${environment.baseUrl}/assets/backgrounds/starfield-tile-512x512.png`);
        this.load.audio('background-music', `${environment.baseUrl}/assets/audio/space-marine-theme.ogg`);
    }

    create(): void {
        SpaceSimClient.mode = 'multiplayer';
        this._gameLevel = null;
        SpaceSimClient.playerShipId = null;
        this._ships.clear();
        this._supplies.clear();
        this._stellarBodies = new Array<StellarBody>();

        this._exploder = new UiExploder(this);

        // disable camera until we have our ship
        this.cameras.main.fadeOut(0, 0, 0, 0);

        this._playMusic();

        this._shouldGetMap = true;
        this._needsResize = true;
    }

    update(time: number, delta: number): void {
        if (this._shouldGetMap) {
            this._shouldGetMap = false;
            SpaceSimClient.socket.sendRequestMapRequest(SpaceSimClient.playerData);
        }
        if (this._shouldCreateStellarBodies) {
            this._shouldCreateStellarBodies = false;
            this._createStellarBodiesLayer();
        }
        if (this._shouldGetPlayer) {
            this._shouldGetPlayer = false;
            this._getPlayerFromServer();
        }
        if (this._shouldResize) {
            this._shouldResize = false;
            this.resize();
        }
        if (this._shouldShowHud) {
            this._shouldShowHud = false;
            SpaceSim.game.scene.start(MultiplayerHudSceneConfig.key);
            SpaceSim.game.scene.bringToTop(MultiplayerHudSceneConfig.key);
        }
        try {
            this._processEndScene();
            this._processRemoveShipsQueue();
            this._processUpdateShipsQueue();
            this.getShips().forEach(p => p?.update(time, delta));
            this._processRemoveSuppliesQueue();
            this._processFlickerSuppliesQueue();
            this._processUpdateSuppliesQueue();

            this._stellarBodies.forEach((body) => {
                body?.update(time, delta);
            });

            if (SpaceSimClient.socket?.disconnected) {
                if (this._disconnectTimer == null) {
                    this._disconnectTimer = window.setTimeout(() => this.queueEndScene(), 10000);
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
        Helpers.log('debug', `resize called; resetting width, height, background, camera and radar`);
        this._width = this.game.scale.displaySize.width;
        this._height = this.game.scale.displaySize.height;
        this._createBackground();
        this._setupCamera();
        this._createMiniMap();
    }

    public override queueSupplyUpdates<T extends ShipSupplyOptions>(opts: Array<T>): BaseScene {
        this._updateSuppliesQueue.splice(this._updateSuppliesQueue.length, 0, ...opts);
        return this;
    }

    public override queueSupplyRemoval(...ids: Array<string>): BaseScene {
        this._removeSuppliesQueue.splice(this._removeSuppliesQueue.length, 0, ...ids);
        return this;
    }

    public override queueSupplyFlicker(...ids: Array<string>): BaseScene {
        this._flickerSuppliesQueue.splice(this._flickerSuppliesQueue.length, 0, ...ids);
        return this;
    }

    public override queueShipUpdates<T extends ShipConfig>(opts: T[]): BaseScene {
        this._updateShipsQueue.splice(this._updateShipsQueue.length, 0, ...opts);
        return this;
    }

    public override queueShipRemoval(...ids: Array<string>): BaseScene {
        this._removeShipsQueue.splice(this._removeShipsQueue.length, 0, ...ids);
        return this;
    }

    private async _getPlayerFromServer(): Promise<void> {
        // handle case of client self destruct by notifying server of our destruction
        this.events.on(Constants.Events.SHIP_DEATH, (cfg: ShipConfig) => {
            if (cfg.id === SpaceSimClient.playerShipId) {
                SpaceSimClient.socket?.sendPlayerDeathNotice(SpaceSimClient.playerData);
            }
        });

        SpaceSimClient.socket.sendRequestShipRequest(SpaceSimClient.playerData);
    }

    private _createStellarBodiesLayer(): void {
        Helpers.log('debug', `creating StellarBodies...`);
        const room: RoomPlus = this.getLevel().rooms[0];
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

    private _setupCamera(): void {
        let zoom = 1;
        if (this._width < 400 || this._height < 400) {
            zoom = 0.5;
        }
        if (this._camera) {
            this._camera.destroy();
        }
        this._camera = new Camera(this, {
            name: 'main',
            zoom: zoom,
            ignore: [
                this.getLevel().radarLayer,
                ...this.getShips<PlayerShip>()
                    .map(p => p.radarSprite)
                    .filter(p => p != null)
            ],
            backgroundColor: 0x000000,
            followObject: this._ships.get(SpaceSimClient.playerShipId)
        });
        this._camera.cam.fadeIn(1000, 255, 255, 255);
    }

    private _createMiniMap(): void {
        const miniWidth = this._width / 4;
        const miniHeight = this._height / 4;
        let miniSize = (miniWidth < miniHeight) ? miniWidth : miniHeight;
        if (miniSize < 150) {
            miniSize = 150;
        }
        if (this._radar) {
            this._radar.destroy();
        }
        this._radar = new Radar(this, {
            x: this._width - ((miniSize / 2) + 10),
            y: miniSize,
            width: miniSize,
            height: miniSize,
            ignore: [
                this._backgroundStars, 
                ...this._stellarBodies.map(b => b.getGameObject()),
                this.getLevel().wallsLayer
            ],
            followObject: this._ships.get(SpaceSimClient.playerShipId)
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
        const activeShips = this.getShips().filter(s => s.active);
        for (let activeShip of activeShips) {
            if (ship.id !== activeShip.id) {
                this.physics.add.collider(ship, activeShip);
            }
        }
    }

    public override queueEndScene(): BaseScene {
        this._shouldEndScene = true;
        return this;
    }

    private _processEndScene(): void {
        if (this._shouldEndScene) {
            this._shouldEndScene = false;
            this._camera.cam.fadeOut(2000, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                if (progress === 1) {
                    this.game.scene.start(GameOverSceneConfig.key);
                    this.game.scene.stop(MultiplayerHudSceneConfig.key);
                    this.game.scene.stop(this);
                }
            });
        }
    }

    private _processUpdateShipsQueue(): void {
        Helpers.trycatch(() => {
            const opts = this._updateShipsQueue.splice(0, this._updateShipsQueue.length);
            opts.forEach(o => {
                let ship = this._ships.get(o.id) as PlayerShip;
                if (ship) {
                    // update existing ship
                    ship.configure(o);
                } else {
                    // or create new ship if doesn't already exist
                    Helpers.log('debug', `creating new PlayerShip ${JSON.stringify(o)}`);
                    ship = new PlayerShip(this, {
                        ...o,
                        engine: PlayerEngine,
                        weapon: PlayerMachineGun
                    });
                    this._ships.set(o.id, ship);
                    this.physics.add.collider(ship, this.getLevel().wallsLayer);
                    this._addPlayerCollisionPhysicsWithPlayers(ship);
                    Helpers.trycatch(() => this._camera?.ignore(ship.radarSprite), 'none');
                }

                if (this._needsResize && ship?.id === SpaceSimClient.playerShipId) {
                    this._needsResize = false;
                    this._shouldResize = true;
                    this._shouldShowHud = true;
                }
            });
        }, 'debug', `error in processing ShipOptions array from Server`, 'message');
    }

    private _processRemoveShipsQueue(): void {
        Helpers.trycatch(() => {
            const ids = this._removeShipsQueue.splice(0, this._removeShipsQueue.length);
            for (let id of ids) {
                const ship = this._ships.get(id);
                if (ship) {
                    Helpers.log('debug', `removing ship '${id}'`);
                    this._exploder.explode({location: ship.location});
                    this._ships.delete(id);
                    ship.destroy();

                    if (SpaceSimClient.playerShipId === id) {
                        Helpers.log('info', `player ship removed; queuing game over...`);
                        this.queueEndScene();
                    }
                }
            }
        }, 'debug', `error in processing removeShipsQueue`, 'message');
    }

    private _processUpdateSuppliesQueue(): void {
        Helpers.trycatch(() => {
            const opts = this._updateSuppliesQueue.splice(0, this._updateSuppliesQueue.length);
            opts.forEach(o => {
                let supply = this._supplies.get(o.id);
                if (supply) {
                    // update existing supply
                    supply?.configure(o);
                } else {
                    // or create new supply if doesn't already exist
                    Helpers.log('debug', `creating new ShipSupply ${JSON.stringify(o)}`);
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
                    Helpers.trycatch(() => this._radar?.ignore(supply), 'none');
                }
            });
        }, 'debug', `error in processing ShipSupplyOptions array from server`, 'message');
    }

    private _processRemoveSuppliesQueue(): void {
        Helpers.trycatch(() => {
            const ids = this._removeSuppliesQueue.splice(0, this._removeSuppliesQueue.length);
            for (let id of ids) {
                const supply = this.getSupply(id);
                if (supply) {
                    Helpers.log('debug', `removing supply '${supply.id}'`);
                    supply.destroy();
                    this._supplies.delete(id);
                }
            }
        }, 'debug', `error in processing removeSuppliesQueue`, 'message');
    }

    private _processFlickerSuppliesQueue(): void {
        Helpers.trycatch(() => {
            const ids = this._flickerSuppliesQueue.splice(0, this._flickerSuppliesQueue.length);
            for (let id of ids) {
                const supply = this.getSupply(id);
                if (supply) {
                    Animations.flicker(supply, -1, () => null);
                }
            }
        }, 'debug', `error in processing flickerSuppliesQueue`, 'message');
    }
}