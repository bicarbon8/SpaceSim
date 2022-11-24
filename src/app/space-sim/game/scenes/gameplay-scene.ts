import { Vector2 } from "phaser/src/math";
import { ShipPod } from "../ships/ship-pod";
import { CannonAttachment } from "../ships/attachments/offence/cannon-attachment";
import { ThrusterAttachment } from "../ships/attachments/utility/thruster-attachment";
import { StellarBody } from "../star-systems/stellar-body";
import { GameMap, RoomPlus } from "../map/game-map";
import { environment } from "../../../../environments/environment";
import { Constants } from "../utilities/constants";
import { SpaceSim } from "../space-sim";
import { Helpers } from "../utilities/helpers";
import { StellarBodyOptions } from "../star-systems/stellar-body-options";
import { GameScoreTracker } from "../utilities/game-score-tracker";
import { Resizable } from "../interfaces/resizable";
import { OffenceAttachment } from "../ships/attachments/offence/offence-attachment";
import { MachineGunAttachment } from "../ships/attachments/offence/machine-gun-attachment";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'gameplay-scene'
};

export class GameplayScene extends Phaser.Scene implements Resizable {
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
        this.load.image('ship-pod', `${environment.baseUrl}/assets/sprites/ship-pod.png`);
        this.load.image('thruster', `${environment.baseUrl}/assets/sprites/thruster.png`);
        this.load.image('overheat-glow', `${environment.baseUrl}/assets/particles/red-glow.png`);
        this.load.image('cannon', `${environment.baseUrl}/assets/sprites/cannon.png`);
        this.load.spritesheet('flares', `${environment.baseUrl}/assets/particles/flares.png`, {
            frameWidth: 130,
            frameHeight: 132,
            startFrame: 0,
            endFrame: 4
        });
        this.load.image('explosion', `${environment.baseUrl}/assets/particles/explosion.png`);
        this.load.image('bullet', `${environment.baseUrl}/assets/sprites/bullet.png`);
        this.load.image('box', `${environment.baseUrl}/assets/sprites/box.png`);

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
        this._createMapAndPlayer();
        this.resize();
        this._createStellarBodiesLayer();
        this._createBackground();
        this._createOpponents();
        this._playMusic();

        SpaceSim.game.scene.start('gameplay-hud-scene');
        SpaceSim.game.scene.bringToTop('gameplay-hud-scene');
    }

    resize(): void {
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;
        this._createBackground();
        this._setupCamera();
    }

    update(time: number, delta: number): void {
        try {
            SpaceSim.player?.update(time, delta);
            const shipPos = SpaceSim.player?.getLocation();
            const tile = SpaceSim.map?.getLayer()?.worldToTileXY(shipPos.x, shipPos.y);
            const room = SpaceSim.map?.getRoomAt(tile.x, tile.y);

            // If the player has entered a new room, make it visible
            if (room) {
                SpaceSim.map?.showRoom(room);
            }

            this._stellarBodies.forEach((body) => {
                body.update(time, delta);
            });
        } catch (e) {
            /* ignore */
        }
    }

    private _createOpponents(): void {
        // remove all pre-existing (happens on replay)
        SpaceSim.opponents.splice(0, SpaceSim.opponents.length);
        
        // add opponent in each room
        SpaceSim.map.getRooms().forEach((room: RoomPlus) => {
            var tl: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.left + 1, room.top + 1);
            var br: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.right - 1, room.bottom - 1);
            var pos: Phaser.Math.Vector2 = Helpers.vector2(
                Phaser.Math.RND.realInRange(tl.x + 50, br.x - 50), 
                Phaser.Math.RND.realInRange(tl.y + 50, br.y - 50)
            );
            var p: ShipPod = new ShipPod({scene: this, location: pos});
            p.getGameObject().setAlpha(0); // hidden until player enters room
            SpaceSim.opponents.push(p);
            room.opponents = new Array<ShipPod>(p);

            this.physics.add.collider(p.getGameObject(), SpaceSim.map.getGameObject(), () => {
                p.sustainDamage({
                    amount: (p.getSpeed() / Constants.Ship.MAX_VELOCITY) * (Constants.Ship.MAX_INTEGRITY / 33),
                    timestamp: this.time.now
                });
            });
            this.physics.add.collider(p.getGameObject(), SpaceSim.player.getGameObject(), () => {
                p.sustainDamage({
                    amount: 1, 
                    timestamp: this.time.now,
                    attackerId: SpaceSim.player.id,
                    message: 'ship collision'
                }); // TODO: set based on opposing speeds
                SpaceSim.player.sustainDamage({
                    amount: 1, 
                    timestamp: this.time.now,
                    attackerId: p.id,
                    message: 'ship collision'
                });
            });
        });
    }

    private _createMapAndPlayer(): void {
        SpaceSim.map = new GameMap(this);
        
        // Place the player in random empty tile in the first room
        const startingRoom = SpaceSim.map.getRoomClosestToOrigin();
        const startTopLeft: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(startingRoom.left + 1, startingRoom.top + 1);
        const startBottomRight: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(startingRoom.right - 1, startingRoom.bottom - 1);
        const playerStartingPosition: Phaser.Math.Vector2 = Helpers.vector2(
            Phaser.Math.RND.realInRange(startTopLeft.x, startBottomRight.x), 
            Phaser.Math.RND.realInRange(startTopLeft.y, startBottomRight.y)
        );
        SpaceSim.player = new ShipPod({scene: this, location: playerStartingPosition});
        
        // TODO: have menu allowing selection of attachments
        let thruster: ThrusterAttachment = new ThrusterAttachment({scene: this});
        SpaceSim.player.attachments.addAttachment(thruster);
        let weapon: OffenceAttachment; 
        // weapon = new CannonAttachment({scene: this});
        weapon = new MachineGunAttachment({scene: this});
        SpaceSim.player.attachments.addAttachment(weapon);

        this.physics.add.collider(SpaceSim.player.getGameObject(), SpaceSim.map.getGameObject(), () => {
            SpaceSim.player.sustainDamage({
                amount:(SpaceSim.player.getSpeed() / Constants.Ship.MAX_VELOCITY) * (Constants.Ship.MAX_INTEGRITY / 33),
                timestamp: this.time.now
            });
        });

        this.events.addListener(Constants.Events.PLAYER_DEATH, (ship: ShipPod) => {
            if (SpaceSim.player.id == ship?.id) {
                this.cameras.main.fadeOut(2000, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                    if (progress === 1) {
                        this.game.scene.start('game-over-scene');
                        this.game.scene.stop('gameplay-hud-scene');
                        this.game.scene.stop(this);
                    }
                });
            } else {
                GameScoreTracker.opponentDestroyed();
            }
        })
    }

    private _createStellarBodiesLayer(): void {
        let rooms = SpaceSim.map.getRooms();
        let bodies: StellarBodyOptions[] = [
            {spriteName: 'sun'}, 
            {spriteName: 'venus', rotationSpeed: 0}, 
            {spriteName: 'mercury', rotationSpeed: 0}
        ];
        for (var i=0; i<rooms.length; i+=3) {
            let room = rooms[i];
            let startTopLeft: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.left, room.top);
            let startBottomRight: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.right, room.bottom);
            let location: Phaser.Math.Vector2 = Helpers.vector2(
                Phaser.Math.RND.realInRange(startTopLeft.x, startBottomRight.x), 
                Phaser.Math.RND.realInRange(startTopLeft.y, startBottomRight.y)
            );
            let opts: StellarBodyOptions = bodies[Phaser.Math.RND.between(0, 2)];
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
        let playerLoc: Vector2 = SpaceSim.player.getLocation();
        this.cameras.main.centerOn(playerLoc.x, playerLoc.y);

        this.cameras.main.startFollow(SpaceSim.player.getGameObject(), true, 1, 1);
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