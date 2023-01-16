import * as Phaser from "phaser";
import { Constants, Exploder, GameLevel, GameObjectPlus, Helpers, RoomPlus, Ship, ShipOptions, ShipSupply, ShipSupplyOptions, SpaceSim, BaseScene, GameLevelOptions } from "space-sim-shared";
import { StellarBody } from "../star-systems/stellar-body";
import { environment } from "../../../../environments/environment";
import { SpaceSimClient } from "../space-sim-client";
import { StellarBodyOptions } from "../star-systems/stellar-body";
import { Resizable } from "../interfaces/resizable";
import { AiController } from "../controllers/ai-controller";
import { Radar } from "../ui-components/radar";
import { Camera } from "../ui-components/camera";
import { PlayerShip } from "../ships/player-ship";
import { PlayerAmmoSupply } from "../ships/supplies/player-ammo-supply";
import { PlayerCoolantSupply } from "../ships/supplies/player-coolant-supply";
import { PlayerFuelSupply } from "../ships/supplies/player-fuel-supply";
import { PlayerRepairsSupply } from "../ships/supplies/player-repairs-supply";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'gameplay-scene'
};

export class GameplayScene extends BaseScene implements Resizable {
    setLevel<T extends GameLevelOptions>(opts: T): BaseScene {
        throw new Error("Method not implemented.");
    }
    updateShips<T extends ShipOptions>(opts: T[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    removeShips(...ids: string[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    updateSupplies<T extends ShipSupplyOptions>(opts: T[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    removeSupplies(...ids: string[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    flickerSupplies(...ids: string[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    endScene(): BaseScene {
        throw new Error("Method not implemented.");
    }
    private _width: number;
    private _height: number;
    private _stellarBodies: StellarBody[];
    private _backgroundStars: Phaser.GameObjects.TileSprite;
    private _music: Phaser.Sound.BaseSound;
    private _exploder: Exploder;
    private _gameLevel: GameLevel;
    private readonly _supplies = new Map<string, ShipSupply>();
    private readonly _ships = new Map<string, Ship>();
    private _camera: Camera;
    private _radar: Radar;

    private _physicsUpdator: Generator<void, void, unknown>;

    debug: boolean;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);

        this.debug = SpaceSim.debug;
        this._stellarBodies = [];

        SpaceSimClient.mode = 'singleplayer';
        this._ships = new Map<string, Ship>();
        this._supplies = new Map<string, ShipSupply>();
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

    get playerShip(): PlayerShip {
        return this.getShipsMap<PlayerShip>()?.get(SpaceSimClient.playerShipId);
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
        SpaceSimClient.mode = 'singleplayer';
        this.cameras.resetAll();
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;
        this._exploder = new Exploder(this);
        this._createMapAndPlayer();
        this._createStellarBodiesLayer();
        this._createBackground();
        this._createOpponents();
        this._playMusic();

        SpaceSim.game.scene.start('gameplay-hud-scene');
        SpaceSim.game.scene.bringToTop('gameplay-hud-scene');

        this.resize();
    }

    resize(): void {
        this.cameras.resetAll();
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;
        this._createBackground();
        this._setupCamera();
        this._createMiniMap();
    }

    update(time: number, delta: number): void {
        try {
            this.getShips().forEach(p => p.update(time, delta));

            // If the player has entered a new room, make it visible
            const currentLoc = this.playerShip.getLocation();
            const currentRoom = this.getLevel().getRoomAtWorldXY(currentLoc.x, currentLoc.y);
            this._showRoom(currentRoom);

            // disable all objects offscreen (plus margin of error)
            if (this._physicsUpdator == null || this._physicsUpdator?.next().done) {
                this._physicsUpdator = this._updatePhysics();
                this._physicsUpdator?.next();
            }

            const nearbyEnemies = SpaceSimClient.opponents.filter(o => o?.ship?.active);
            nearbyEnemies.forEach(o => o.update(time, delta));

            this._stellarBodies.forEach((body) => {
                body.update(time, delta);
            });
        } catch (e) {
            /* ignore */
        }
    }

    /**
     * use Generator function to allow yielding control while iterating
     * through all the scene's children to enable / disable physics so we
     * don't spend too much time and delay the calls to `scene.update`
     */
    private *_updatePhysics(): Generator<void, void, unknown> {
        const loc = this.playerShip.getLocation();
        const {width, height} = SpaceSimClient.getSize();
        const dist = (width > height) ? width : height;
        const children = this.children.getAll();
        for (var i=0; i<children.length; i++) {
            const c = children[i];
            // skip over the map tiles
            if (c !== this.getLevel().getGameObject()) {
                // and skip over objects that don't have physics bodies 
                const arcade = c.body as Phaser.Physics.Arcade.Body;
                if (arcade) {
                    const gop = c as GameObjectPlus;
                    const d = Phaser.Math.Distance.BetweenPoints(gop, loc);
                    if (d <= dist * 2) {
                        // enable physics on objects close to player
                        this.physics.world.enable(c);
                    } else {
                        // and disable physics on objects far offscreen
                        this.physics.world.disable(c);
                    }
                    yield;
                }
            }
        }
    }

    private _createOpponents(): void {
        // remove all pre-existing (happens on replay)
        SpaceSimClient.opponents.splice(0, SpaceSimClient.opponents.length);
        
        // add opponent in each room
        for (var room of this.getLevel().getRooms()) {
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
                engineKey: Phaser.Math.RND.between(1, 3)
            });
            p.getGameObject().setAlpha(0); // hidden until player enters room
            this.physics.world.disable(p.getGameObject()); // disabled until player close to opponent
            let controller = new AiController(this, p);
            SpaceSimClient.opponents.push(controller);
            this._ships.set(p.id, p);
        };
    }

    private _createMapAndPlayer(): void {
        this._gameLevel = new GameLevel(this, {
            doorPadding: 2
        });
        this.getLevel().alpha = 0; // hide until player enters room
        
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
            engineKey: Phaser.Math.RND.between(1, 3)
        });
        SpaceSimClient.playerShipId = ship.id;
        this._ships.set(ship.id, ship);
        
        // setup collision with map walls
        this.physics.add.collider(this.playerShip.getGameObject(), this.getLevel().getGameObject());

        // setup listener for player death event
        this.events.on(Constants.Events.PLAYER_DEATH, (shipOpts: ShipOptions) => {
            this._exploder.explode({location: shipOpts.location});
            if (this.playerShip.id == shipOpts?.id) {
                this.cameras.main.fadeOut(2000, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                    if (progress === 1) {
                        this.game.scene.start('game-over-scene');
                        this.game.scene.stop('gameplay-hud-scene');
                        this.game.scene.stop(this);
                    }
                });
            } else {
                this._expelSupplies(shipOpts);
            }
            this._ships.delete(shipOpts?.id);
        });
    }

    private _createStellarBodiesLayer(): void {
        let rooms = this.getLevel().getRooms();
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
                this.getLevel().minimapLayer,
                ...this.getShips<PlayerShip>()
                    .map(p => p.radarSprite)
                    .filter(p => p != null)
            ],
            backgroundColor: 0x000000,
            followObject: this.playerShip.getGameObject()
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
                this.getLevel().getGameObject()
            ],
            followObject: this.playerShip.getGameObject()
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

    private _showRoom(room: RoomPlus): void {
        if (!room.visible) {
            room.visible = true;
            const opponentsInRoom = SpaceSimClient.opponents
                .map(o => o?.ship)
                .filter(s => {
                    const shipLoc = s.getLocation();
                    const shipRoom = this.getLevel().getRoomAtWorldXY(shipLoc.x, shipLoc.y);
                    return shipRoom === room;
                });
            this.add.tween({
                targets: [
                    ...this.getLevel().getLayer().getTilesWithin(room.x, room.y, room.width, room.height),
                    ...this.getLevel().minimapLayer.getTilesWithin(room.x, room.y, room.width, room.height), 
                    ...opponentsInRoom.map(o => o.getGameObject())
                ],
                alpha: 1,
                duration: 250
            });
            // enable physics for enemies in the room
            opponentsInRoom.forEach(o => {
                // setup collision with map walls
                this.physics.add.collider(o.getGameObject(), this.getLevel().getGameObject());
                // setup collision with player
                this.physics.add.collider(o.getGameObject(), this.playerShip.getGameObject(), () => {
                    const collisionSpeed = o.getVelocity().clone().subtract(this.playerShip.getVelocity()).length();
                    const damage = collisionSpeed / Constants.Ship.MAX_SPEED; // maximum damage of 1
                    o.sustainDamage({
                        amount: damage, 
                        timestamp: this.time.now,
                        attackerId: this.playerShip.id,
                        message: 'ship collision'
                    });
                    this.playerShip.sustainDamage({
                        amount: damage, 
                        timestamp: this.time.now,
                        attackerId: o.id,
                        message: 'ship collision'
                    });
                });
            });
        }
    }

    private _expelSupplies(shipCfg: ShipOptions): void {
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
        this.physics.add.collider(supply, this.getLevel().getGameObject());
        this.physics.add.collider(supply, this.playerShip.getGameObject(), () => {
                this._supplies.delete(supply.id);
                supply.apply(this.playerShip);
                supply.destroy();
        });
        return supply;
    }
}