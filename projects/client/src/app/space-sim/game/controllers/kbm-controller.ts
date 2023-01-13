import { Constants, Ship } from "space-sim-shared";
import { SpaceSimClient } from "../space-sim-client";
import { InputController } from "./input-controller";
import { MouseTracker } from "./mouse-tracker";

export class KbmController extends InputController {
    private _mouseTracker: MouseTracker;
    
    /** Input Handlers */
    private _thrustForwardsKey: Phaser.Input.Keyboard.Key;
    private _thrustBackwardsKey: Phaser.Input.Keyboard.Key;
    private _strafeLeftKey: Phaser.Input.Keyboard.Key;
    private _strafeRightKey: Phaser.Input.Keyboard.Key;
    private _boostKey: Phaser.Input.Keyboard.Key;
    private _rotateAttachmentsClockwiseKey: Phaser.Input.Keyboard.Key;
    private _rotateAttachmentsAntiClockwiseKey: Phaser.Input.Keyboard.Key;
    private _detachAttachmentKey: Phaser.Input.Keyboard.Key;
    private _throwAttachmentKey: Phaser.Input.Keyboard.Key;
    private _grabAttachmentKey: Phaser.Input.Keyboard.Key;

    private _container: Phaser.GameObjects.Container;
    
    constructor(scene: Phaser.Scene, player?: Ship) {
        super(scene, player);

        this._createGameObject();

        this._setupInputHandling();

        this._mouseTracker = new MouseTracker(this.ship);
    }
        
    update(time: number, delta: number): void {
        this._mouseTracker.update(time, delta);
        if (this.active) {
            // activate Thruster
            if (this._thrustForwardsKey.isDown) {
                SpaceSimClient.socket?.emit(Constants.Socket.TRIGGER_ENGINE, SpaceSimClient.playerData);
                this.ship.getThruster()?.trigger();
            }
            // reverse Thruster
            if (this._thrustBackwardsKey.isDown) {
                // this.player.getThruster()?.thrustBackwards();
            }
            // strafe Left
            if (this._strafeLeftKey.isDown) {
                // this.player.getThruster()?.strafeLeft();
            }
            // strafe Right
            if (this._strafeRightKey.isDown) {
                // this.player.getThruster()?.strafeRight();
            }
            // activate Booster
            if (this._boostKey.isDown) {
                // this.player.getThruster()?.boostForwards();
            }
            // Left Click: fire any weapons
            if (this.scene.input.activePointer.leftButtonDown()) {
                SpaceSimClient.socket?.emit(Constants.Socket.TRIGGER_WEAPON, SpaceSimClient.playerData);
                this.ship.getWeapons()?.trigger();
            }
            if (this._rotateAttachmentsClockwiseKey.isDown) {
                // this.player.attachments.rotateAttachmentsClockwise();
            }
            if (this._rotateAttachmentsAntiClockwiseKey.isDown) {
                // this.player.attachments.rotateAttachmentsAntiClockwise();
            }
            // discard Front Attachment
            if (this._detachAttachmentKey.isDown) {
                // this.player.attachments.removeAttachmentAt(AttachmentLocation.front);
            }
            // throw Front Attachment
            if (this._throwAttachmentKey.isDown) {
                // this.player.attachments.throwAttachmentAt(AttachmentLocation.front);
            }
            // grab nearby Attachments
            if (this._grabAttachmentKey.isDown) {
                // TODO: grab nearby attachments and attach them to player
            }
        }
    }

    getGameObject(): Phaser.GameObjects.Container {
        return this._container;
    }
    
    private _setupInputHandling(): void {
        this._thrustForwardsKey = this.scene.input.keyboard.addKey('SPACE', true, true);
        // this._thrustForwardsKey = this.scene.input.keyboard.addKey('W', true, true);
        this._thrustBackwardsKey = this.scene.input.keyboard.addKey('S', true, true);
        this._strafeLeftKey = this.scene.input.keyboard.addKey('A', true, true);
        this._strafeRightKey = this.scene.input.keyboard.addKey('D', true, true);
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

    _createGameObject(): void {
        this._container = this.scene.add.container();
    }
}