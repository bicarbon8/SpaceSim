import { Vector2 } from "phaser/src/math";
import { ShipPod } from "../ships/ship-pod";
import { CannonAttachment } from "../ships/attachments/offence/cannon-attachment";
import { ThrusterAttachment } from "../ships/attachments/utility/thruster-attachment";
import { MachineGunAttachment } from "../ships/attachments/offence/machine-gun-attachment";
import { InputController } from "../controllers/input-controller";
import { TouchController } from "../controllers/touch-controller";
import { KbmController } from "../controllers/kbm-controller";
import { ShipAttachment } from "../ships/attachments/ship-attachment";
import { AttachmentLocation } from "../ships/attachments/attachment-location";
import { SystemBody } from "../star-systems/system-body";
import { GameMap } from "../star-systems/game-map";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'GameplayScene'
};

export class GameplayScene extends Phaser.Scene {
    private _player: ShipPod;
    private _map: GameMap;
    private _solarSystemBodies: SystemBody[];
    private _controller: InputController;
    private _debugLayer: Phaser.GameObjects.Layer;
    private _debugGroup: Phaser.GameObjects.Group;
    private _foregroundLayer: Phaser.GameObjects.Layer;
    private _foregroundGroup: Phaser.GameObjects.Group;
    private _midgroundLayer: Phaser.GameObjects.Layer;
    private _midgroundGroup: Phaser.GameObjects.Group;
    private _starSystemLayer: Phaser.GameObjects.Layer;
    private _starSystemGroup: Phaser.GameObjects.Group;
    private _backgroundLayer: Phaser.GameObjects.Layer;
    private _backgroundGroup: Phaser.GameObjects.Group;
    private _debugText: Phaser.GameObjects.Text;

    debug: boolean;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        let conf: Phaser.Types.Scenes.SettingsConfig = settingsConfig || sceneConfig;
        super(conf);

        this._solarSystemBodies = [];

        this.debug = true;
    }

    preload(): void {
        this.load.image('ship-pod', './assets/sprites/ship-pod.png');
        this.load.image('thruster', './assets/sprites/thruster.png');
        this.load.image('cannon', './assets/sprites/cannon.png');
        this.load.image('machine-gun', './assets/sprites/machine-gun.png');
        this.load.spritesheet('flares', './assets/particles/flares.png', {
            frameWidth: 130,
            frameHeight: 132,
            startFrame: 0,
            endFrame: 4
        });
        this.load.image('explosion', './assets/particles/explosion.png');
        this.load.image('bullet', './assets/sprites/bullet.png');
        this.load.image('box', './assets/sprites/box.png');

        this.load.image('metaltiles', './assets/tiles/metaltiles.png');

        this.load.image('sun', './assets/backgrounds/sun.png');

        this.load.image('far-stars', './assets/backgrounds/starfield-tile-512x512.png');
    }

    create(): void {
        this._createPlayer();

        this._setupCamera();
        
        this._createBackgroundLayer();
        this._createStarSystemLayer();
        this._createMidgroundLayer();
        this._createForegroundLayer();
        this._createDebugLayer();
    }

    update(time: number, delta: number): void {
        this._controller?.update(time, delta);
        this._player?.update(time, delta);
        this._updateStarSystemObjects(time, delta);
        if (this.debug) {
            this._displayDebugInfo();
        }
        this._offsetDebugObjects();
        this._offsetForegroundObjects();
        this._offsetBackgroundObjects();
    }

    private _updateStarSystemObjects(time: number, delta: number): void {
        this._solarSystemBodies.forEach((systemBody: SystemBody) => {
            systemBody.update(time, delta);
        });
    }

    private _offsetDebugObjects(): void {
        let offset: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(10, 10);
        this._debugGroup.setXY(offset.x, offset.y);
    }

    private _offsetForegroundObjects(): void {
        let offset: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(0, 0);
        this._foregroundGroup.setXY(offset.x, offset.y);
    }

    private _offsetBackgroundObjects(): void {
        let offset: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(Math.ceil(this.game.canvas.width / 2), Math.ceil(this.game.canvas.height / 2));
        this._backgroundGroup.setXY(offset.x, offset.y);
    }

    private _createPlayer(): void {
        this._player = new ShipPod(this);
        
        // TODO: have menu allowing selection of attachments
        let thruster: ThrusterAttachment = new ThrusterAttachment(this);
        this._player.attachments.addAttachment(thruster);
        let canon: CannonAttachment = new CannonAttachment(this);
        this._player.attachments.addAttachment(canon);
        this._player.attachments.rotateAttachmentsClockwise();
        let machineGun: MachineGunAttachment = new MachineGunAttachment(this);
        this._player.attachments.addAttachment(machineGun);
    }

    private _createDebugLayer(): void {
        this._debugLayer = this.add.layer();
        this._debugLayer.setName('debug');
        this._debugLayer.depth = 4;

        this._debugGroup = this.add.group();

        this._debugText = this.add.text(10, 10, '', { font: '16px Courier', fontStyle: 'color: #ffdddd' });

        this._debugGroup.add(this._debugText);
        this._debugLayer.add(this._debugText);
    }

    private _createForegroundLayer(): void {
        this._foregroundLayer = this.add.layer();
        this._foregroundLayer.setName('foreground');
        this._foregroundLayer.depth = 3;

        this._foregroundGroup = this.add.group();

        if (this.game.device.os.desktop) {
            this._controller = new KbmController(this, this._player);
        } else {
            this._controller = new TouchController(this, this._player);
            this._foregroundGroup.add((this._controller as TouchController).getGameObject());
            this._foregroundLayer.add((this._controller as TouchController).getGameObject());
        }
    }

    private _createMidgroundLayer(): void {
        this._midgroundLayer = this.add.layer();
        this._midgroundLayer.setName('midground');
        this._midgroundLayer.depth = 2;

        this._midgroundGroup = this.add.group();

        this._midgroundGroup.add(this._player.getGameObject());
        this._midgroundLayer.add(this._player.getGameObject());

        this._map = new GameMap(this);
    }

    private _createStarSystemLayer(): void {
        this._starSystemLayer = this.add.layer();
        this._starSystemLayer.setName('starsystem');
        this._starSystemLayer.depth = 1;

        this._starSystemGroup = this.add.group();

        // TODO: support multiple large stars and planets
        this._solarSystemBodies.push(new SystemBody(this, this._player, {spriteName: 'sun'}));

        this._solarSystemBodies.forEach((body: SystemBody) => {
            this._starSystemGroup.add(body.getGameObject());
            this._starSystemLayer.add(body.getGameObject());
        });
    }

    private _createBackgroundLayer(): void {
        this._backgroundLayer = this.add.layer();
        this._backgroundLayer.setName('background');
        this._backgroundLayer.depth = 0;

        this._backgroundGroup = this.add.group();

        let xOffset: number = Math.ceil(this.game.canvas.width / 2);
        let yOffset: number = Math.ceil(this.game.canvas.height / 2);
        let starField = this.add.tileSprite(xOffset, yOffset, this.game.canvas.width, this.game.canvas.height, 'far-stars');

        this._backgroundGroup.add(starField);
        this._backgroundLayer.add(starField);
    }

    private _setupCamera(): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 0, g: 0, b: 0});
        
        this.cameras.main.setZoom(1);
        let playerLoc: Vector2 = this._player.getLocation();
        this.cameras.main.centerOn(playerLoc.x, playerLoc.y);

        this.cameras.main.startFollow(this._player.getGameObject(), true, 1, 1);
    }

    private _displayDebugInfo(): void {
        let loc: Phaser.Math.Vector2 = this._player.getLocation();
        let v: Phaser.Math.Vector2 = this._player.getVelocity();
        let info: string[] = [
            `Speed: ${this._player.getSpeed().toFixed(1)}`,
            `Integrity: ${this._player.getIntegrity().toFixed(1)}`,
            `Heat: ${this._player.getTemperature().toFixed(1)}`,
            `Fuel: ${this._player.getRemainingFuel().toFixed(1)}`,
            `Location: ${loc.x.toFixed(1)},${loc.y.toFixed(1)}`,
            `Angle: ${this._player.getRotation().toFixed(1)}`,
            `Velocity: ${v.x.toFixed(1)},${v.y.toFixed(1)}`
        ];
        let attachments: ShipAttachment[] = this._player.attachments.getAttachments();
        for (var i=0; i<attachments.length; i++) {
            if (attachments[i]) {
                info.push(`AttachmentLocation.${AttachmentLocation[i]} - ${i}`);
                let attLoc: Phaser.Math.Vector2 = attachments[i].getLocation();
                info.push(`-- Location: ${attLoc.x.toFixed(1)},${attLoc.y.toFixed(1)}`);
                info.push(`-- Angle: ${attachments[i].getRotation().toFixed(1)}`);
            }
        }
        this._debugText.setText(info);
    }
}