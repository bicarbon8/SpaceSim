import { Vector2 } from "phaser/src/math";
import { ShipPod } from "../ships/ship-pod";
import { CannonAttachment } from "../ships/attachments/offence/cannon-attachment";
import { ZoomableScene } from "./zoomable-scene";
import { ThrusterAttachment } from "../ships/attachments/utility/thruster-attachment";
import { Helpers } from "../utilities/helpers";
import { MachineGunAttachment } from "../ships/attachments/offence/machine-gun-attachment";
import { InputController } from "../utilities/input-controller";
import { TouchController } from "../utilities/touch-controller";
import { KbmController } from "../utilities/kbm-controller";
import { ShipAttachment } from "../ships/attachments/ship-attachment";
import { AttachmentLocation } from "../ships/attachments/attachment-location";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'ShipScene'
};

export class ShipScene extends Phaser.Scene {
    private _player: ShipPod;
    private _solarSystemBodies: Phaser.GameObjects.Sprite[];
    private _controller: InputController;
    private _debugLayer: Phaser.GameObjects.Layer;
    private _foregroundLayer: Phaser.GameObjects.Layer;
    private _midgroundLayer: Phaser.GameObjects.Layer;
    private _starSystemLayer: Phaser.GameObjects.Layer;
    private _backgroundLayer: Phaser.GameObjects.Layer;
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

    update(): void {
        this._controller?.update();
        this._player?.update();
        this._updateSolarSystemBodies();
        if (this.debug) {
            this._displayDebugInfo();
        }
        this._offsetForeground();
        this._offsetBackground();
    }

    private _updateSolarSystemBodies(): void {
        this._solarSystemBodies.forEach((systemBody: Phaser.GameObjects.Sprite) => {
            switch (systemBody.name) {
                case 'sun':
                    this._rotateSolarSystemBody(systemBody, Phaser.Math.RND.between(0.0001, 0.0005));
                    break;
                default:
                    this._rotateSolarSystemBody(systemBody, Phaser.Math.RND.between(0.001, 0.005));
                    break;
            }

            this._offsetSolarSystemBody(systemBody);
        });
    }

    private _rotateSolarSystemBody(sun: Phaser.GameObjects.Sprite, angle: number): void {
        sun.angle += angle;
        if (sun.angle >= 360) {
            sun.angle = 0;
        }
    }

    private _offsetSolarSystemBody(body: Phaser.GameObjects.Sprite): void {
        let playerV: Phaser.Math.Vector2 = this._player.getVelocity();
        let playerLoc: Phaser.Math.Vector2 = this._player.getLocation();

        // move the sun in the opposite direction of travel at a rate of 1:500
        let bodyV: Phaser.Math.Vector2 = playerV.divide(Helpers.vector2(500)).negate();
        let distance = bodyV.multiply(Helpers.vector2(this.game.loop.delta));

        body.x = playerLoc.x + distance.x;
        body.y = playerLoc.y + distance.y;
    }

    private _offsetBackground(): void {
        this._backgroundLayer.getChildren().forEach((obj: Phaser.GameObjects.TileSprite) => {
            let playerLoc: Phaser.Math.Vector2 = this._player.getRealLocation();
            obj.x = playerLoc.x;
            obj.y = playerLoc.y;
        });
    }

    private _offsetForeground(): void {
        this._foregroundLayer.getChildren().forEach((obj: Phaser.GameObjects.Text) => {
            let playerLoc: Phaser.Math.Vector2 = this._player.getRealLocation();
            obj.x = playerLoc.x;
            obj.y = playerLoc.y;
        });
    }

    private _createPlayer(): void {
        this._player = new ShipPod(this, {
            location: Helpers.vector2(this.game.canvas.width / 2, this.game.canvas.height / 2)
        });
        
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

        this._debugText = this.add.text(10, 10, '', { font: '16px Courier', fontStyle: 'color: #ffdddd' });

        this._debugLayer.add(this._debugText);
    }

    private _createForegroundLayer(): void {
        this._foregroundLayer = this.add.layer();
        this._foregroundLayer.setName('foreground');
        this._foregroundLayer.depth = 3;

        if (this.game.device.os.desktop) {
            this._controller = new KbmController(this, this._player);
        } else {
            this._controller = new TouchController(this, this._player);
        }

        this._foregroundLayer.add(this._controller.getGameObject());
    }

    private _createMidgroundLayer(): void {
        this._midgroundLayer = this.add.layer();
        this._midgroundLayer.setName('midground');
        this._midgroundLayer.depth = 2;

        this._midgroundLayer.add(this._player.getGameObject());
    }

    private _createStarSystemLayer(): void {
        this._starSystemLayer = this.add.layer();
        this._starSystemLayer.setName('starsystem');
        this._starSystemLayer.depth = 1;

        let startPosition = new Phaser.Math.Vector2(
            Phaser.Math.RND.between(0, this.game.canvas.width),
            Phaser.Math.RND.between(0, this.game.canvas.height)
        );
        // TODO: support multiple large stars and planets
        this._solarSystemBodies.push(this.add.sprite(startPosition.x, startPosition.y, 'sun'));

        this._solarSystemBodies.forEach((body: Phaser.GameObjects.Sprite) => {
            this._starSystemLayer.add(body);
        });
    }

    private _createBackgroundLayer(): void {
        this._backgroundLayer = this.add.layer();
        this._backgroundLayer.setName('background');
        this._backgroundLayer.depth = 0;

        let xOffset: number = Math.ceil(this.game.canvas.width / 2);
        let yOffset: number = Math.ceil(this.game.canvas.height / 2);
        let starField = this.add.tileSprite(xOffset, yOffset, this.game.canvas.width, this.game.canvas.height, 'far-stars');

        this._backgroundLayer.add(starField);
    }

    private _setupCamera(): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 0, g: 0, b: 0});
        
        this.cameras.main.setZoom(1);
        let playerLoc: Vector2 = this._player.getRealLocation();
        this.cameras.main.centerOn(playerLoc.x, playerLoc.y);

        this.cameras.main.startFollow(this._player.getGameObject(), true, 1, 1);
    }

    private _displayDebugInfo(): void {
        let loc: Phaser.Math.Vector2 = this._player.getRealLocation();
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
                let attLoc: Phaser.Math.Vector2 = attachments[i].getRealLocation();
                info.push(`-- Location: ${attLoc.x.toFixed(1)},${attLoc.y.toFixed(1)}`);
                info.push(`-- Angle: ${attachments[i].getRotation().toFixed(1)}`);
            }
        }
        this._debugText.setText(info);
    }
}