import { AttachmentLocation } from "../ships/attachments/attachment-location";
import { ShipAttachment } from "../ships/attachments/ship-attachment";
import { ThrusterAttachment } from "../ships/attachments/utility/thruster-attachment";
import { ShipPod } from "../ships/ship-pod";
import { InputController } from "./input-controller";
import { MouseTracker } from "./mouse-tracker";

export class KbmController extends InputController {
    private _mouseTracker: MouseTracker;
    
    /** Input Handlers */
    private _thrustKey: Phaser.Input.Keyboard.Key;
    private _boostKey: Phaser.Input.Keyboard.Key;
    private _rotateAttachmentsClockwiseKey: Phaser.Input.Keyboard.Key;
    private _rotateAttachmentsAntiClockwiseKey: Phaser.Input.Keyboard.Key;
    private _detachAttachmentKey: Phaser.Input.Keyboard.Key;
    private _throwAttachmentKey: Phaser.Input.Keyboard.Key;
    private _grabAttachmentKey: Phaser.Input.Keyboard.Key;
    
    constructor(scene: Phaser.Scene, player?: ShipPod) {
        super(scene, player);

        this._setupInputHandling();

        this._mouseTracker = new MouseTracker(this.scene);
        this.player.setTarget(this._mouseTracker);
    }
        
    update(time: number, delta: number): void {
        if (this.active) {
            // activate Thruster
            if (this._thrustKey.isDown) {
                let thruster: ThrusterAttachment = this.player.getThruster();
                if (thruster) {
                    thruster.thrustFowards();
                }
            }
            // activate Booster
            if (this._boostKey.isDown) {
                let thruster: ThrusterAttachment = this.player.getThruster();
                if (thruster) {
                    thruster.boostForwards();
                }
            }
            // Left Click: fire any weapons
            if (this.scene.input.activePointer.leftButtonDown()) {
                let a: ShipAttachment = this.player.attachments.getAttachmentAt(AttachmentLocation.front);
                if (a) {
                    a.trigger();
                }
            }
            if (this._rotateAttachmentsClockwiseKey.isDown) {
                this.player.attachments.rotateAttachmentsClockwise();
            }
            if (this._rotateAttachmentsAntiClockwiseKey.isDown) {
                this.player.attachments.rotateAttachmentsAntiClockwise();
            }
            // discard Front Attachment
            if (this._detachAttachmentKey.isDown) {
                this.player.attachments.removeAttachmentAt(AttachmentLocation.front);
            }
            // throw Front Attachment
            if (this._throwAttachmentKey.isDown) {
                this.player.attachments.throwAttachmentAt(AttachmentLocation.front);
            }
            // grab nearby Attachments
            if (this._grabAttachmentKey.isDown) {
                // TODO: grab nearby attachments and attach them to player
            }
        }
    }
    
    private _setupInputHandling(): void {
        this._thrustKey = this.scene.input.keyboard.addKey('SPACE', true, true);
        this._boostKey = this.scene.input.keyboard.addKey('TAB', true, false);
        this._rotateAttachmentsClockwiseKey = this.scene.input.keyboard.addKey('E', true, false);
        this._rotateAttachmentsAntiClockwiseKey = this.scene.input.keyboard.addKey('Q', true, false);
        this._detachAttachmentKey = this.scene.input.keyboard.addKey('X', true, false);
        this._throwAttachmentKey = this.scene.input.keyboard.addKey('T', true, false);
        this._grabAttachmentKey = this.scene.input.keyboard.addKey('G', true, false);
        this.game.canvas.oncontextmenu = (e) => {
            e.preventDefault();
        }
    }
}