import { Vector2 } from "phaser/src/math";
import { Key } from "phaser/src/input";
import { SettingsConfig } from "phaser/src/scene";
import { ShipPod } from "../ships/ship-pod";
import { CannonAttachment } from "../ships/attachments/offence/cannon-attachment";
import { ZoomableScene } from "./zoomable-scene";
import { AttachmentLocation } from "../ships/attachments/attachment-location";
import { ShipAttachment } from "../ships/attachments/ship-attachment";
import { ThrusterAttachment } from "../ships/attachments/utility/thruster-attachment";
import { Helpers } from "../utilities/helpers";
import { OffenceAttachment } from "../ships/attachments/offence/offence-attachment";
import { MachineGunAttachment } from "../ships/attachments/offence/machine-gun-attachment";
import { Globals } from "../utilities/globals";

const sceneConfig: SettingsConfig = {
    active: true,
    visible: true,
    key: 'ShipScene'
};

export class ShipScene extends ZoomableScene {
    private _player: ShipPod;

    /** Input Handlers */
    private _thrustKey: Key;
    private _boostKey: Key;
    private _rotateAttachmentsClockwiseKey: Key;
    private _rotateAttachmentsAntiClockwiseKey: Key;
    private _detachAttachmentKey: Key;
    private _throwAttachmentKey: Key;
    private _grabAttachmentKey: Key;
    
    constructor() {
        super(0.4, sceneConfig);
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
    }

    create(): void {
        super.create();
        this._player = new ShipPod(this, {location: Helpers.vector2()});
        this._player.setTarget(this.mouse);

        // TODO: have menu allowing selection of attachments
        let thruster: ThrusterAttachment = new ThrusterAttachment(this);
        this._player.attachments.addAttachment(thruster);
        let canon: CannonAttachment = new CannonAttachment(this);
        this._player.attachments.addAttachment(canon);
        this._player.attachments.rotateAttachmentsClockwise();
        let machineGun: MachineGunAttachment = new MachineGunAttachment(this);
        this._player.attachments.addAttachment(machineGun);

        Globals.player = this._player;

        this._setupCamera(this._player);
        this._setupInputHandling();
    }

    update(): void {
        // activate Thruster
        if (this._thrustKey.isDown) {
            let thruster: ThrusterAttachment = this._player.getThruster();
            if (thruster) {
                thruster.thrustFowards();
            }
        }
        // activate Booster
        if (this._boostKey.isDown) {
            let thruster: ThrusterAttachment = this._player.getThruster();
            if (thruster) {
                thruster.boostForwards();
            }
        }
        // Left Click: fire any weapons
        if (this.input.activePointer.leftButtonDown()) {
            for (var i=0; i<Helpers.enumLength(AttachmentLocation); i++) {
                if (this._player.attachments.getAttachment(i) instanceof OffenceAttachment) {
                    let a: OffenceAttachment = this._player.attachments.getAttachment(i) as OffenceAttachment;
                    a.trigger();
                }
            }
        }
        // Right Click: activate front attachment
        if (this.input.activePointer.rightButtonDown()) {
            let a: ShipAttachment = this._player.attachments.getAttachment(AttachmentLocation.front);
            if (a) {
                a.trigger();
            }
        }
        if (this._rotateAttachmentsClockwiseKey.isDown) {
            this._player.attachments.rotateAttachmentsClockwise();
        }
        if (this._rotateAttachmentsAntiClockwiseKey.isDown) {
            this._player.attachments.rotateAttachmentsAntiClockwise();
        }
        // discard Front Attachment
        if (this._detachAttachmentKey.isDown) {
            this._player.attachments.removeAttachment(AttachmentLocation.front);
        }
        // throw Front Attachment
        if (this._throwAttachmentKey.isDown) {
            this._player.attachments.throwAttachment(AttachmentLocation.front);
        }
        // grab nearby Attachments
        if (this._grabAttachmentKey.isDown) {
            // TODO: grab nearby attachments and attach them to player
        }
        this._player.update();
    }

    private _setupInputHandling(): void {
        this._thrustKey = this.input.keyboard.addKey('SPACE', true, true);
        this._boostKey = this.input.keyboard.addKey('TAB', true, false);
        this._rotateAttachmentsClockwiseKey = this.input.keyboard.addKey('E', true, false);
        this._rotateAttachmentsAntiClockwiseKey = this.input.keyboard.addKey('Q', true, false);
        this._detachAttachmentKey = this.input.keyboard.addKey('X', true, false);
        this._throwAttachmentKey = this.input.keyboard.addKey('T', true, false);
        this._grabAttachmentKey = this.input.keyboard.addKey('G', true, false);
        this.game.canvas.oncontextmenu = (e) => {
            e.preventDefault();
        }
    }

    private _setupCamera(player: ShipPod): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 0, g: 0, b: 0});
        
        this.cameras.main.setZoom(1);
        let playerLoc: Vector2 = player.getRealLocation();
        this.cameras.main.centerOn(playerLoc.x, playerLoc.y);

        this.cameras.main.startFollow(player.getGameObject(), true, 1, 1);
    }
}