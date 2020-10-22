import { ShipPod } from "../ships/ship-pod";
import { Globals } from "../utilities/globals";
import { CannonAttachment } from "../ships/attachments/offence/cannon-attachment";
import { ZoomableScene } from "./zoomable-scene";
import { AttachmentLocation } from "../ships/attachments/attachment-location";
import { ShipAttachment } from "../ships/attachments/ship-attachment";
import { ThrusterAttachment } from "../ships/attachments/utility/thruster-attachment";
import { Helpers } from "../utilities/helpers";
import { OffenceAttachment } from "../ships/attachments/offence/offence-attachment";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'ShipScene'
};

export class ShipScene extends ZoomableScene {
    private player: ShipPod;

    /** Input Handlers */
    private thrustKey: Phaser.Input.Keyboard.Key;
    private boostKey: Phaser.Input.Keyboard.Key;
    private rotateAttachmentsClockwiseKey: Phaser.Input.Keyboard.Key;
    private rotateAttachmentsAntiClockwiseKey: Phaser.Input.Keyboard.Key;
    private detachAttachmentKey: Phaser.Input.Keyboard.Key;
    private throwAttachmentKey: Phaser.Input.Keyboard.Key;
    private grabAttachmentKey: Phaser.Input.Keyboard.Key;
    
    constructor() {
        super(0.4, sceneConfig);
    }

    preload(): void {
        this.load.image('ship-pod', './assets/sprites/ship-pod.png');
        this.load.image('thruster', './assets/sprites/thruster.png');
        this.load.image('cannon', './assets/sprites/cannon.png');
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
        this.player = new ShipPod(this, {
            x: 0,
            y: 0
        });
        Globals.player = this.player;
        this.player.setTarget(this.mouse);

        // TMP
        let thruster: ThrusterAttachment = new ThrusterAttachment(this);
        this.player.attachments.addAttachment(thruster);
        let canon: CannonAttachment = new CannonAttachment(this);
        this.player.attachments.addAttachment(canon);

        this.setupCamera(this.player);
        this.setupInputHandling();
    }

    update(): void {
        // activate Thruster
        if (this.thrustKey.isDown) {
            let thruster: ThrusterAttachment = this.player.getThruster();
            if (thruster) {
                thruster.thrustFowards();
            }
        }
        // activate Booster
        if (this.boostKey.isDown) {
            let thruster: ThrusterAttachment = this.player.getThruster();
            if (thruster) {
                thruster.boostForwards();
            }
        }
        // Left Click: fire any weapons
        if (this.input.activePointer.leftButtonDown()) {
            for (var i=0; i<Helpers.enumLength(AttachmentLocation); i++) {
                if (this.player.attachments.getAttachment(i) instanceof OffenceAttachment) {
                    let a: OffenceAttachment = this.player.attachments.getAttachment(i) as OffenceAttachment;
                    a.trigger();
                }
            }
        }
        // Right Click: activate front attachment
        if (this.input.activePointer.rightButtonDown()) {
            let a: ShipAttachment = this.player.attachments.getAttachment(AttachmentLocation.front);
            if (a) {
                a.trigger();
            }
        }
        if (this.rotateAttachmentsClockwiseKey.isDown) {
            this.player.attachments.rotateAttachmentsClockwise();
        }
        if (this.rotateAttachmentsAntiClockwiseKey.isDown) {
            this.player.attachments.rotateAttachmentsAntiClockwise();
        }
        // discard Front Attachment
        if (this.detachAttachmentKey.isDown) {
            this.player.attachments.removeAttachment(AttachmentLocation.front);
        }
        // throw Front Attachment
        if (this.throwAttachmentKey.isDown) {
            this.player.attachments.throwAttachment(AttachmentLocation.front);
        }
        // grab nearby Attachments
        if (this.grabAttachmentKey.isDown) {
            // TODO: grab nearby attachments and attach them to player
        }
        this.player.update();
    }

    private setupInputHandling(): void {
        this.thrustKey = this.input.keyboard.addKey('SPACE', true, true);
        this.boostKey = this.input.keyboard.addKey('TAB', true, false);
        this.rotateAttachmentsClockwiseKey = this.input.keyboard.addKey('E', true, false);
        this.rotateAttachmentsAntiClockwiseKey = this.input.keyboard.addKey('Q', true, false);
        this.detachAttachmentKey = this.input.keyboard.addKey('X', true, false);
        this.throwAttachmentKey = this.input.keyboard.addKey('T', true, false);
        this.grabAttachmentKey = this.input.keyboard.addKey('G', true, false);
        this.game.canvas.oncontextmenu = (e) => {
            e.preventDefault();
        }
    }

    private setupCamera(player: ShipPod): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 0, g: 0, b: 0});
        
        this.cameras.main.setZoom(1);
        let playerLoc: Phaser.Math.Vector2 = player.getRealLocation();
        this.cameras.main.centerOn(playerLoc.x, playerLoc.y);

        this.cameras.main.startFollow(player.getGameObject(), true, 1, 1);
    }
}