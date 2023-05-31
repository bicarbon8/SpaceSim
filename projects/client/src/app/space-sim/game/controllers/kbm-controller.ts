import { BaseScene, Helpers, InputController, Logging, SpaceSim } from "space-sim-shared";
import { SpaceSimClient } from "../space-sim-client";

export class KbmController extends InputController {
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
    private _engineEnabled: boolean = false;
    private _weaponEnabled: boolean = false;
    private _pointerLocLast: Phaser.Types.Math.Vector2Like;
    
    constructor(scene: Phaser.Scene) {
        super(scene);

        this._createGameObject();

        this._setupInputHandling();
    }

    get parentScene(): BaseScene {
        return (this.scene?.['parentScene'] as BaseScene);
    }

    get pointer(): Phaser.Input.Pointer {
        return this.parentScene?.input?.activePointer;
    }

    get pointerLocation(): Phaser.Types.Math.Vector2Like {
        return this.pointer?.positionToCamera(this.parentScene?.cameras?.main);
    }
        
    update(time: number, delta: number): void {
        if (this.active) {
            const ploc = this.pointerLocation;
            if (!this._pointerLocLast 
                || !Phaser.Math.Fuzzy.Equal(ploc.x, this._pointerLocLast.x, 1) 
                || !Phaser.Math.Fuzzy.Equal(ploc.y, this._pointerLocLast.y, 1)) {
                this._pointerLocLast = ploc;
                const ship = this.parentScene?.getShip?.(SpaceSimClient.playerShipId);
                if (ship) {
                    const shipPos = ship.location;
                    const radians: number = Phaser.Math.Angle.Between(ploc.x, ploc.y, shipPos.x, shipPos.y);
                    const degrees: number = Number(Helpers.rad2deg(radians).toFixed(0));
                    // only update if angle changed more than minimum allowed degrees
                    if (!Phaser.Math.Fuzzy.Equal(ship.rotationContainer.angle, degrees, SpaceSim.Constants.Ships.MIN_ROTATION_ANGLE)) {
                        this.parentScene?.events.emit(SpaceSim.Constants.Events.SHIP_ANGLE, SpaceSimClient.playerShipId, degrees);
                    }
                }
            }
            // activate Thruster
            if (this._thrustForwardsKey.isDown) {
                if (!this._engineEnabled) {
                    this._engineEnabled = true;
                    this.parentScene?.events.emit(SpaceSim.Constants.Events.ENGINE_ON, SpaceSimClient.playerShipId, true);
                }
            } else {
                if (this._engineEnabled) {
                    this._engineEnabled = false;
                    this.parentScene?.events.emit(SpaceSim.Constants.Events.ENGINE_ON, SpaceSimClient.playerShipId, false);
                }
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
            if (this.pointer.leftButtonDown()) {
                if (!this._weaponEnabled) {
                    this._weaponEnabled = true;
                    this.parentScene?.events.emit(SpaceSim.Constants.Events.WEAPON_FIRING, SpaceSimClient.playerShipId, true);
                }
            } else {
                if (this._weaponEnabled) {
                    this._weaponEnabled = false;
                    this.parentScene?.events.emit(SpaceSim.Constants.Events.WEAPON_FIRING, SpaceSimClient.playerShipId, false);
                }
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