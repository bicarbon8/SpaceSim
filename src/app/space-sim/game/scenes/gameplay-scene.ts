import { Vector2 } from "phaser/src/math";
import { ShipPod } from "../ships/ship-pod";
import { CannonAttachment } from "../ships/attachments/offence/cannon-attachment";
import { ThrusterAttachment } from "../ships/attachments/utility/thruster-attachment";
import { InputController } from "../controllers/input-controller";
import { TouchController } from "../controllers/touch-controller";
import { KbmController } from "../controllers/kbm-controller";
import { StellarBody } from "../star-systems/stellar-body";
import { GameMap } from "../map/game-map";
import { environment } from "../../../../environments/environment";
import { Constants } from "../utilities/constants";
import { SpaceSim } from "../space-sim";
import { Helpers } from "../utilities/helpers";
import { Room } from "@mikewesthad/dungeon";
import { AttachmentLocation } from "../ships/attachments/attachment-location";
import { OffenceAttachment } from "../ships/attachments/offence/offence-attachment";
import { StellarBodyOptions } from "../star-systems/stellar-body-options";
import { GameScoreTracker } from "../utilities/game-score-tracker";
import { GameStats } from "../utilities/game-stats";
import { Resizable } from "../interfaces/resizable";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'gameplay-scene'
};

export class GameplayScene extends Phaser.Scene implements Resizable {
    private _width: number;
    private _height: number;
    private _controller: InputController;
    private _hudText: Phaser.GameObjects.Text;
    private _scoreText: Phaser.GameObjects.Text;
    private _stellarBodies: StellarBody[];
    private _backgroundMusic: Phaser.Sound.BaseSound;

    debug: boolean;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);

        this.debug = SpaceSim.debug;
        this._stellarBodies = [];
    }

    preload(): void {
        this.load.image('ship-pod', `${environment.baseUrl}/assets/sprites/ship-pod.png`);
        this.load.image('thruster', `${environment.baseUrl}/assets/sprites/thruster.png`);
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
        this._playBackgroundMusic();

        GameScoreTracker.start();
    }

    resize(): void {
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;

        this._createHUD();
        this._setupCamera();
        this._createController();
    }

    update(time: number, delta: number): void {
        this._controller?.update(time, delta);
        SpaceSim.player?.update(time, delta);
        this._stellarBodies.forEach((body) => {
            body.update(time, delta);
        });
        this._displayHUDInfo();
    }

    private _createOpponents(): void {
        SpaceSim.map.getRooms().forEach((room: Room) => {
            var tl: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.left + 1, room.top + 1);
            var br: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.right - 1, room.bottom - 1);
            var pos: Phaser.Math.Vector2 = Helpers.vector2(
                Phaser.Math.RND.realInRange(tl.x, br.x), 
                Phaser.Math.RND.realInRange(tl.y, br.y)
            );
            var p: ShipPod = new ShipPod({scene: this, location: pos});
            SpaceSim.opponents.push(p);

            this.physics.add.collider(p.getGameObject(), SpaceSim.map.getGameObject(), () => {
                p.sustainDamage({
                    amount: (p.getSpeed() / Constants.MAX_VELOCITY) * (Constants.MAX_INTEGRITY / 33),
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

    private _createHUD(): void {
        if (this._hudText) {
            this._hudText.destroy();
        }
        this._hudText = this.add.text(10, 10, '', { font: '12px Courier', color: '#ffdddd' });
        this._hudText.setScrollFactor(0); // keep fixed in original location on screen
        this._hudText.setDepth(Constants.DEPTH_HUD);

        if (this._scoreText) {
            this._scoreText.destroy();
        }
        this._scoreText = this.add.text(0, 0, 'SAMPLE TEXT', {font: '20px Courier', color: '#808080', stroke: '#ffff00', strokeThickness: 4});
        this._scoreText.setDepth(Constants.DEPTH_CONTROLS);
        this._scoreText.setX((this._width/2)-(this._scoreText.width/2));
        this._scoreText.setY(this._scoreText.height);
        this._scoreText.setScrollFactor(0); // keep fixed in original location on screen
        this._scoreText.setDepth(Constants.DEPTH_HUD);
    }

    private _createController(): void {
        if (this._controller) {
            (this._controller as TouchController)?.getGameObject()?.destroy();
        }
        
        if (this.game.device.os.desktop) {
            this._controller = new KbmController(this, SpaceSim.player);
        } else {
            this._controller = new TouchController(this, SpaceSim.player);
        }
    }

    private _createMapAndPlayer(): void {
        SpaceSim.map = new GameMap({scene: this});
        
        // Place the player in random empty tile in the first room
        const startingRoom = SpaceSim.map.getRooms()[0];
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
        let cannon: CannonAttachment = new CannonAttachment({scene: this});
        SpaceSim.player.attachments.addAttachment(cannon);

        this.physics.add.collider(SpaceSim.player.getGameObject(), SpaceSim.map.getGameObject(), () => {
            SpaceSim.player.sustainDamage({
                amount:(SpaceSim.player.getSpeed() / Constants.MAX_VELOCITY) * (Constants.MAX_INTEGRITY / 33),
                timestamp: this.time.now
            });
        });

        this.events.addListener(Constants.EVENT_PLAYER_DEATH, (ship: ShipPod) => {
            if (SpaceSim.player.id == ship?.id) {
                this.cameras.main.fadeOut(2000, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                    if (progress === 1) {
                        this.game.scene.start('game-over-scene');
                        this._backgroundMusic.stop();
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
        const width = this.game.canvas.width;
	    const height = this.game.canvas.height;
        const starField = this.add.tileSprite(width/2, height/2, width*3, height*3, 'far-stars');
        starField.setDepth(Constants.DEPTH_BACKGROUND);
        starField.setScrollFactor(0.01); // slight movement to appear very far away
    }

    private _setupCamera(): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 0, g: 0, b: 0});
        
        this.cameras.main.setZoom(1);
        let playerLoc: Vector2 = SpaceSim.player.getLocation();
        this.cameras.main.centerOn(playerLoc.x, playerLoc.y);

        this.cameras.main.startFollow(SpaceSim.player.getGameObject(), true, 1, 1);
    }

    private _displayHUDInfo(): void {
        try {
            let loc: Phaser.Math.Vector2 = SpaceSim.player.getLocation();
            let info: string[] = [
                `Speed: ${SpaceSim.player.getSpeed().toFixed(1)}`,
                `Integrity: ${SpaceSim.player.getIntegrity().toFixed(1)}`,
                `Heat: ${SpaceSim.player.getTemperature().toFixed(1)}`,
                `Fuel: ${SpaceSim.player.getRemainingFuel().toFixed(1)}`,
                `Ammo: ${(SpaceSim.player.attachments.getAttachmentAt(AttachmentLocation.front) as OffenceAttachment)?.ammo || 0}`
            ];
            if (SpaceSim.debug) {
                info.push(`Location: ${loc.x.toFixed(1)},${loc.y.toFixed(1)}`);
            }
            this._hudText.setText(info);

            let stats: GameStats = GameScoreTracker.getStats();
            let score: string[] = [
                `Elapsed: ${(stats.elapsed/1000).toFixed(1)}`,
                `Enemies: ${stats.opponentsDestroyed}/${SpaceSim.opponents.length}`,
                `Score: ${GameScoreTracker.getScore().toFixed(0)}`
            ]
            this._scoreText.setText(score);
        } catch (e) {
            // do nothing
        }
    }

    private _playBackgroundMusic(): void {
        this._backgroundMusic = this.sound.add('background-music', {loop: true, volume: 0.1});
        this._backgroundMusic.play();
    }
}