import * as Phaser from "phaser";
import { RoomPlus, Ship, ShipSupply, ShipSupplyOptions, SpaceSim, BaseScene, GameLevelOptions, ShipConfig, GameLevel, TryCatch, Helpers } from "space-sim-shared";
import { StellarBody } from "../star-systems/stellar-body";
import { environment } from "../../../../environments/environment";
import { SpaceSimClient } from "../space-sim-client";
import { StellarBodyOptions } from "../star-systems/stellar-body";
import { Resizable } from "../interfaces/resizable";
import { Radar } from "../ui-components/radar";
import { Camera } from "../ui-components/camera";
import { PlayerShip } from "../ships/player-ship";
import { PlayerAmmoSupply } from "../ships/supplies/player-ammo-supply";
import { PlayerCoolantSupply } from "../ships/supplies/player-coolant-supply";
import { PlayerFuelSupply } from "../ships/supplies/player-fuel-supply";
import { PlayerRepairsSupply } from "../ships/supplies/player-repairs-supply";
import { GameOverSceneConfig } from "./game-over-scene";
import { GameplayHudSceneConfig } from "./gameplay-hud-scene";
import { UiExploder } from "../ui-components/ui-exploder";
import { PlayerStandardEngine } from "../ships/attachments/utility/player-standard-engine";
import { PlayerBullet } from "../ships/attachments/offence/player-bullet";
import { PlayerMachineGun } from "../ships/attachments/offence/player-machine-gun";
import { ClientGameLevel } from "../levels/client-game-level";
import { ClientAiController } from "../controllers/client-ai-controller";
import { PlayerPlasmaGun } from "../ships/attachments/offence/player-plasma-gun";
import { PlayerSportsEngine } from "../ships/attachments/utility/player-sports-engine";
import { PlayerEconomyEngine } from "../ships/attachments/utility/player-economy-engine";
import { PlayerCannon } from "../ships/attachments/offence/player-cannon";

export const GameplaySceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'gameplay-scene'
} as const;

export class GameplayScene extends BaseScene implements Resizable {
    queueGameLevelUpdate<T extends GameLevelOptions>(opts: T): BaseScene {
        throw new Error("Method not implemented.");
    }
    queueShipUpdates<T extends ShipConfig>(opts: T[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    queueShipRemoval(...ids: string[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    queueSupplyUpdates<T extends ShipSupplyOptions>(opts: T[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    queueSupplyRemoval(...ids: string[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    queueSupplyFlicker(...ids: string[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    queueEndScene(): BaseScene {
        throw new Error("Method not implemented.");
    }
    private _width: number;
    private _height: number;
    private _stellarBodies: StellarBody[];
    private _backgroundStars: Phaser.GameObjects.TileSprite;
    private _music: Phaser.Sound.BaseSound;
    private _exploder: UiExploder;
    private _gameLevel: GameLevel;
    private readonly _supplies = new Map<string, ShipSupply>();
    private readonly _ships = new Map<string, Ship>();
    private _camera: Camera;
    private _radar: Radar;

    debug: boolean;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || GameplaySceneConfig);

        this.debug = SpaceSim.debug;
        this._stellarBodies = [];

        SpaceSimClient.mode = 'singleplayer';
        this._ships = new Map<string, Ship>();
        this._supplies = new Map<string, ShipSupply>();
    }

    override getLevel<T extends GameLevel>(): T {
        return this._gameLevel as T;
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

    get playerShip(): PlayerShip {
        return this.getShip<PlayerShip>(SpaceSimClient.playerShipId);
    }

    preload(): void {
        PlayerShip.preload(this);
        PlayerStandardEngine.preload(this);
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
        SpaceSimClient.mode = 'singleplayer';
        this.cameras.resetAll();
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;
        this._exploder = new UiExploder(this);
        this._createMapAndPlayer();
        this._createStellarBodiesLayer();
        this._createBackground();
        this._createOpponents();
        this._playMusic();

        SpaceSim.game.scene.start(GameplayHudSceneConfig.key);
        SpaceSim.game.scene.bringToTop(GameplayHudSceneConfig.key);

        this.resize();

        this.addRepeatingAction('high', 'update-ships', (time: number, delta: number) => {
            this.getShips().forEach(p => p.update(time, delta));
        }).addRepeatingAction('high', 'update-enemy-controllers', (time: number, delta: number) => {
            const activeEnemies = SpaceSimClient.opponents.filter(o => o?.ship?.active);
            activeEnemies.forEach(o => o.update(time, delta));
        }).addRepeatingAction('medium', 'reveal-room', () => {
            // If the player has entered a new room, make it visible
            const currentLoc = this.playerShip.location;
            const currentRoom = this.getLevel().getRoomAtWorldXY(currentLoc.x, currentLoc.y);
            this._showRoom(currentRoom);
        }).addRepeatingAction('low', 'update-stellar-bodies', (time: number, delta: number) => {
            this._stellarBodies.forEach((body) => {
                body.update(time, delta);
            });
        });
    }

    resize(): void {
        this.cameras.resetAll();
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;
        this._createBackground();
        this._setupCamera();
        this._createMiniMap();
    }

    private _createOpponents(): void {
        // remove all pre-existing (happens on replay)
        SpaceSimClient.opponents.splice(0, SpaceSimClient.opponents.length);
        
        // add opponent in each room
        for (var room of this.getLevel().rooms) {
            let tl: Phaser.Math.Vector2 = this.getLevel().getMapTileWorldLocation(room.left + 1, room.top + 1);
            let br: Phaser.Math.Vector2 = this.getLevel().getMapTileWorldLocation(room.right - 1, room.bottom - 1);
            let pos: Phaser.Math.Vector2 = Helpers.vector2(
                Phaser.Math.RND.realInRange(tl.x + 50, br.x - 50), 
                Phaser.Math.RND.realInRange(tl.y + 50, br.y - 50)
            );
            let p = new PlayerShip(this, {
                location: pos,
                weaponsKey: Phaser.Math.RND.between(1, 3),
                wingsKey: Phaser.Math.RND.between(1, 3),
                cockpitKey: Phaser.Math.RND.between(1, 3),
                engineKey: Phaser.Math.RND.between(1, 3),
                engine: PlayerStandardEngine,
                weapon: PlayerMachineGun
            });
            p.setAlpha(0); // hidden until player enters room
            p.setActive(false);
            // setup collision with map walls
            this.physics.add.collider(p, this.getLevel().wallsLayer, () => {
                const factor = SpaceSim.Constants.Ships.WALL_BOUNCE_FACTOR;
                p.body.velocity.multiply({x: factor, y: factor});
            });
            let controller = new ClientAiController(this, p)
                .setEnemyIds(SpaceSimClient.playerShipId);
            SpaceSimClient.opponents.push(controller);
            this._ships.set(p.id, p);
        };
    }

    private _createMapAndPlayer(): void {
        this._gameLevel = new ClientGameLevel(this, {
            doorPadding: 2
        }).setAlpha(0); // hide until player enters room
        
        // Place the player in random empty tile in the first room
        const startingRoom = this.getLevel().getRoomClosestToOrigin();
        const startTopLeft: Phaser.Math.Vector2 = this.getLevel().getMapTileWorldLocation(startingRoom.left + 1, startingRoom.top + 1);
        const startBottomRight: Phaser.Math.Vector2 = this.getLevel().getMapTileWorldLocation(startingRoom.right - 1, startingRoom.bottom - 1);
        const playerStartingPosition: Phaser.Math.Vector2 = Helpers.vector2(
            Phaser.Math.RND.realInRange(startTopLeft.x, startBottomRight.x), 
            Phaser.Math.RND.realInRange(startTopLeft.y, startBottomRight.y)
        );
        const ship = new PlayerShip(this, {
            location: playerStartingPosition,
            weaponsKey: Phaser.Math.RND.between(1, 3),
            wingsKey: Phaser.Math.RND.between(1, 3),
            cockpitKey: Phaser.Math.RND.between(1, 3),
            engineKey: Phaser.Math.RND.between(1, 3),
            engine: PlayerStandardEngine,
            weapon: PlayerMachineGun
        });
        SpaceSimClient.playerShipId = ship.id;
        this._ships.set(ship.id, ship);
        
        // setup collision with map walls
        this.physics.add.collider(this.playerShip, this.getLevel().wallsLayer, () => {
            const factor = SpaceSim.Constants.Ships.WALL_BOUNCE_FACTOR;
            this.playerShip.body.velocity.multiply({x: factor, y: factor});
        });

        // setup listener for player death event
        this.events.on(SpaceSim.Constants.Events.SHIP_DEATH, (cfg: ShipConfig) => {
            this._exploder.explode({location: cfg?.location});
            if (SpaceSimClient.playerShipId == cfg?.id) {
                this.cameras.main.fadeOut(2000, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                    if (progress === 1) {
                        this.game.scene.start(GameOverSceneConfig.key);
                        this.game.scene.stop(GameplayHudSceneConfig.key);
                        this.game.scene.stop(this);
                    }
                });
            } else {
                this._expelSupplies(cfg);
            }
            this._ships.delete(cfg?.id);
        });
    }

    private _createStellarBodiesLayer(): void {
        let rooms = this.getLevel().rooms;
        let bodies: StellarBodyOptions[] = [
            {spriteName: 'sun'}, 
            {spriteName: 'venus', rotationSpeed: 0}, 
            {spriteName: 'mercury', rotationSpeed: 0},
            {spriteName: 'asteroids', scale: {min: 4, max: 10}}
        ];
        for (var i=0; i<rooms.length; i++) {
            let room = rooms[i];
            let startTopLeft: Phaser.Math.Vector2 = this.getLevel().getMapTileWorldLocation(room.left, room.top);
            let startBottomRight: Phaser.Math.Vector2 = this.getLevel().getMapTileWorldLocation(room.right, room.bottom);
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
        this._backgroundStars.setDepth(SpaceSimClient.Constants.UI.Layers.BACKGROUND);
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
            followObject: this.playerShip
        });
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
            followObject: this.playerShip
        });
    }

    private _playMusic(): void {
        TryCatch.run(() => this._music = this.sound.add('background-music', {loop: true, volume: 0.1}));
        this._music?.play();
        this.events.on(Phaser.Scenes.Events.PAUSE, () => this._music?.pause());
        this.events.on(Phaser.Scenes.Events.RESUME, () => this._music?.resume());
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this._music?.stop());
        this.events.on(Phaser.Scenes.Events.DESTROY, () => this._music?.destroy());
    }

    private _showRoom(room: RoomPlus): void {
        if (!room.visible) {
            room.visible = true;
            const opponentsInRoom = SpaceSimClient.opponents
                .map(o => o?.ship)
                .filter(s => {
                    const shipLoc = s.location;
                    const shipRoom = this.getLevel().getRoomAtWorldXY(shipLoc.x, shipLoc.y);
                    return shipRoom === room;
                });
            this.add.tween({
                targets: [
                    ...this.getLevel().wallsLayer.getTilesWithin(room.x, room.y, room.width, room.height),
                    ...this.getLevel().radarLayer.getTilesWithin(room.x, room.y, room.width, room.height),
                    ...opponentsInRoom
                ],
                alpha: 1,
                duration: 250
            });
            // enable physics for enemies in the room
            opponentsInRoom.forEach(o => {
                // setup collision with player
                o.setActive(true);
                this.physics.add.collider(o, this.playerShip, () => {
                    if (o?.active && this.playerShip?.active) {
                        const collisionSpeed = o.body.velocity.clone().subtract(this.playerShip.body.velocity).length();
                        const damage = collisionSpeed / SpaceSim.Constants.Ships.MAX_SPEED; // maximum damage of 1
                        o.subtractIntegrity(damage, {
                            timestamp: this.time.now,
                            attackerId: this.playerShip.id,
                            message: 'ship collision'
                        });
                        this.playerShip.subtractIntegrity(damage, {
                            timestamp: this.time.now,
                            attackerId: o.id,
                            message: 'ship collision'
                        });
                    }
                });
            });
        }
    }

    private _expelSupplies(shipCfg: ShipConfig): void {
        const supplyOpts = this._exploder.emitSupplies(shipCfg);
        for (var i=0; i<supplyOpts.length; i++) {
            let options = supplyOpts[i];
            let supply = this._addSupplyCollisionPhysics(options);
            this._radar.ignore(supply);
            this._supplies.set(supply.id, supply);
        }
    }

    private _addSupplyCollisionPhysics(options: ShipSupplyOptions): ShipSupply {
        let supply: ShipSupply;
        switch(options.supplyType) {
            case 'ammo':
                supply = new PlayerAmmoSupply(this, options);
                break;
            case 'coolant':
                supply = new PlayerCoolantSupply(this, options);
                break;
            case 'fuel':
                supply = new PlayerFuelSupply(this, options);
                break;
            case 'repairs':
                supply = new PlayerRepairsSupply(this, options);
                break;
            default:
                console.warn(`unknown supplyType sent to _addSupplyCollisionPhysicsWithPlayers:`, options.supplyType);
                break;
        }
        this.physics.add.collider(supply, this.getLevel().wallsLayer, () => {
            const factor = SpaceSim.Constants.Ships.Supplies.WALL_BOUNCE_FACTOR;
            supply.body.velocity.multiply({x: factor, y: factor});
        });
        this.physics.add.collider(supply, this.playerShip, () => {
                this._supplies.delete(supply.id);
                supply.apply(this.playerShip);
                supply.destroy();
        });
        return supply;
    }
}