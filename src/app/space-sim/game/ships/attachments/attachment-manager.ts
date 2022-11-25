import { Vector2 } from "phaser/src/math";
import { HasAttachments } from "../../interfaces/has-attachments";
import { ShipAttachment } from "./ship-attachment";
import { Helpers } from "../../utilities/helpers";
import { AttachmentLocation } from "./attachment-location";
import { Updatable } from "../../interfaces/updatable";
import { Ship } from "../ship";
import { ThrusterAttachment } from "./utility/thruster-attachment";
import { Constants } from "../../utilities/constants";
import { HasGameObject } from "../../interfaces/has-game-object";

export class AttachmentManager implements HasGameObject<Phaser.GameObjects.Container>, HasAttachments, Updatable {
    private _gameObj: Phaser.GameObjects.Container;
    private _attachments: ShipAttachment[] = [];
    readonly ship: Ship;
    private _lastRotatedTime: number;
    private _rotationDelay: number;

    active: boolean;

    constructor(parent: Ship) {
        this.active = true;
        this.ship = parent;
        this._lastRotatedTime = 0;
        this._rotationDelay = 100; // milliseconds

        this._createGameObject();

        for (var i=0; i<Helpers.enumLength(AttachmentLocation); i++) {
            this._attachments.push(null);
        }
    }

    update(time: number, delta: number): void {
        if (this.active) {
            this.getAttachments().forEach(a => a?.update(time, delta));
        }
    }

    getGameObject(): Phaser.GameObjects.Container {
        return this._gameObj;
    }
    
    rotateAttachmentsClockwise(): void {
        const game = this.ship.scene.game;
        if (game.getTime() > this._lastRotatedTime + this._rotationDelay) {
            let tmp: ShipAttachment = this.getAttachmentAt(Helpers.enumLength(AttachmentLocation)-1);
            for (var i=Helpers.enumLength(AttachmentLocation)-1; i>=0; i--) {
                if (i == AttachmentLocation.back) {
                    continue; // skip
                }
                if (i == AttachmentLocation.backLeft) {
                    this._attachments[i] = this._attachments[i-2];
                    continue;
                }
                this._attachments[i] = this._attachments[i-1];
            }
            this._attachments[0] = tmp;
            this._updateAttachmentAngles();
            this._lastRotatedTime = game.getTime();
        }
    }
    
    rotateAttachmentsAntiClockwise(): void {
        const game = this.ship.scene.game;
        if (game.getTime() > this._lastRotatedTime + this._rotationDelay) {
            let tmp: ShipAttachment = this.getAttachmentAt(0);
            for (var i=0; i<Helpers.enumLength(AttachmentLocation); i++) {
                if (i == AttachmentLocation.back) {
                    continue; // skip
                }
                if (i == AttachmentLocation.backRight) {
                    this._attachments[i] = this._attachments[i+2];
                    continue;
                }
                this._attachments[i] = this._attachments[i+1];
            }
            this._attachments[Helpers.enumLength(AttachmentLocation)-1] = tmp;
            this._updateAttachmentAngles();
            this._lastRotatedTime = game.getTime();
        }
    }
    
    /**
     * adds the passed in {ShipAttachment} in {AttachmentLocation.front} or
     * the first open {AttachmentLocation} in a clockwise search. if no open
     * slots exist then the existing {ShipAttachment} at {AttachmentLocation.front}
     * is detached and replaced with the passed in {ShipAttachment}
     * @param attachment the attachment to be added
     */
    addAttachment<T extends ShipAttachment>(attachment: T): void {
        if (attachment instanceof ThrusterAttachment) {
            this.removeAttachmentAt(AttachmentLocation.back);
            this._attachments[AttachmentLocation.back] = attachment;
            attachment.attach(this.ship, AttachmentLocation.back);
        } else {
            let attached: boolean = false;

            for (var i=0; i<Helpers.enumLength(AttachmentLocation); i++) {
                if (!this._attachments[i]) {
                    this._attachments[i] = attachment;
                    attachment.attach(this.ship, i);
                    attached = true;
                    break;
                }
            }

            // if was unable to find an open spot
            if (!attached) {
                // detach current front attachment
                this.removeAttachmentAt(AttachmentLocation.front);
                this._attachments[AttachmentLocation.front] = attachment;
                attachment.attach(this.ship, AttachmentLocation.front);
            }
        }
        this.getGameObject()?.add(attachment?.getGameObject());
        this._updateAttachmentAngles();
    }
    
    removeAttachmentAt(location: AttachmentLocation): void {
        if (this._attachments[location]) {
            let attachment: ShipAttachment = this._attachments[location];
            this._attachments[location] = null;
            this.ship?.getGameObject()?.remove(attachment.getGameObject(), false);
            attachment?.detach();
            this.getGameObject()?.remove(attachment?.getGameObject());

            // move attachment to ship location and rotation and apply current velocity
            let shipRealLocation: Vector2 = this.ship?.getLocation();
            let newLocation: Vector2 = shipRealLocation;
            attachment.getGameObject()?.setPosition(newLocation.x, newLocation.y);
            let shipVelocityVector: Vector2 = this.ship.getVelocity();
            attachment.getPhysicsBody()?.setVelocity(shipVelocityVector);
            attachment.getGameObject()?.setAngle(this.ship.getRotation());
        }
    }
    
    throwAttachmentAt(location: AttachmentLocation): void {
        let attachment: ShipAttachment = this.getAttachmentAt(location);
        if (attachment) {
            let heading = attachment.getHeading();
            this.removeAttachmentAt(location);
            attachment.isThrown = true;
            let deltaV: Vector2 = heading.multiply(new Vector2(Constants.Ship.Attachments.THROW_FORCE, Constants.Ship.Attachments.THROW_FORCE));
            let newV: Vector2 = deltaV.add(attachment.getVelocity());
            // add throw force to current velocity
            attachment.getPhysicsBody().setVelocity(newV.x, newV.y);
        }
    }
    
    getAttachments(): ShipAttachment[] {
        return [...this._attachments];
    }
    
    getAttachmentAt<T extends ShipAttachment>(location: AttachmentLocation): T {
        return this._attachments[location] as T;
    }

    private _updateAttachmentAngles(): void {
        let angle: number = 360 / 8;
        for (var i=0; i<this._attachments.length; i++) {
            let att: ShipAttachment = this._attachments[i];
            if (att) {
                let rot: number = 0;
                switch (i) {
                    case AttachmentLocation.frontRight:
                        rot = angle;
                        break;
                    case AttachmentLocation.right:
                        rot = angle * 2;
                        break;
                    case AttachmentLocation.backRight:
                        rot = angle * 3;
                        break;
                    case AttachmentLocation.back:
                        rot = angle * 4;
                        break;
                    case AttachmentLocation.backLeft:
                        rot = angle * 5;
                        break;
                    case AttachmentLocation.left:
                        rot = angle * 6;
                        break;
                    case AttachmentLocation.frontLeft:
                        rot = angle * 7;
                        break;
                    default:
                        rot = 0;
                        break;
                }
                att.getGameObject().setAngle(rot);
            }
        }
    }

    private _createGameObject(): void {
        this._gameObj = this.ship.scene.add.container(0, 0);
    }
}