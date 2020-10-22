import { HasAttachments } from "../../interfaces/has-attachments";
import { ShipAttachment } from "./ship-attachment";
import { Helpers } from "../../utilities/helpers";
import { AttachmentLocation } from "./attachment-location";
import { Updatable } from "../../interfaces/updatable";
import { ShipPod } from "../ship-pod";
import { ThrusterAttachment } from "./utility/thruster-attachment";
import { timeStamp } from "console";
import { Constants } from "../../utilities/constants";

export class AttachmentManager implements HasAttachments, Updatable {
    private attachments: ShipAttachment[] = [];
    private ship: ShipPod;
    private scene: Phaser.Scene;
    private lastRotatedTime: number;
    private rotationDelay: number;

    active: boolean;

    constructor(parent: ShipPod, scene: Phaser.Scene) {
        this.active = true;
        this.ship = parent;
        this.scene = scene;
        this.lastRotatedTime = 0;
        this.rotationDelay = 100; // milliseconds
        for (var i=0; i<Helpers.enumLength(AttachmentLocation); i++) {
            this.attachments.push(null);
        }
    }

    update(): void {
        if (this.active) {
            for (var i=0; i<this.attachments.length; i++) {
                let a: ShipAttachment = this.attachments[i];
                if (a) {
                    a.update();
                }
            }
        }
    }
    
    rotateAttachmentsClockwise(): void {
        if (this.scene.game.getTime() > this.lastRotatedTime + this.rotationDelay) {
            let tmp: ShipAttachment = this.getAttachment(Helpers.enumLength(AttachmentLocation)-1);
            for (var i=Helpers.enumLength(AttachmentLocation)-1; i>=0; i--) {
                if (i == AttachmentLocation.back) {
                    continue; // skip
                }
                if (i == AttachmentLocation.backLeft) {
                    this.attachments[i] = this.attachments[i-2];
                    continue;
                }
                this.attachments[i] = this.attachments[i-1];
            }
            this.attachments[0] = tmp;
            this.updateAttachmentAngles();
            this.lastRotatedTime = this.scene.game.getTime();
        }
    }
    
    rotateAttachmentsAntiClockwise(): void {
        if (this.scene.game.getTime() > this.lastRotatedTime + this.rotationDelay) {
            let tmp: ShipAttachment = this.getAttachment(0);
            for (var i=0; i<Helpers.enumLength(AttachmentLocation); i++) {
                if (i == AttachmentLocation.back) {
                    continue; // skip
                }
                if (i == AttachmentLocation.backRight) {
                    this.attachments[i] = this.attachments[i+2];
                    continue;
                }
                this.attachments[i] = this.attachments[i+1];
            }
            this.attachments[Helpers.enumLength(AttachmentLocation)-1] = tmp;
            this.updateAttachmentAngles();
            this.lastRotatedTime = this.scene.game.getTime();
        }
    }
    
    /**
     * adds the passed in {ShipAttachment} in {AttachmentLocation.front} or
     * the first open {AttachmentLocation} in a clockwise search. if no open
     * slots exist then the existing {ShipAttachment} at {AttachmentLocation.front}
     * is detached and replaced with the passed in {ShipAttachment}
     * @param attachment the attachment to be added
     */
    addAttachment(attachment: ShipAttachment): void {
        if (attachment instanceof ThrusterAttachment) {
            this.removeAttachment(AttachmentLocation.back);
            this.attachments[AttachmentLocation.back] = attachment;
            attachment.attach(this.ship, AttachmentLocation.back);
        } else {
            let attached: boolean = false;

            for (var i=0; i<Helpers.enumLength(AttachmentLocation); i++) {
                if (!this.attachments[i]) {
                    this.attachments[i] = attachment;
                    attachment.attach(this.ship, i);
                    attached = true;
                    break;
                }
            }

            // if was unable to find an open spot
            if (!attached) {
                // detach current front attachment
                this.removeAttachment(AttachmentLocation.front);
                this.attachments[AttachmentLocation.front] = attachment;
                attachment.attach(this.ship, AttachmentLocation.front);
            }
        }

        this.ship.getGameObject().add(attachment.getGameObject());
        this.updateAttachmentAngles();
    }
    
    removeAttachment(location: AttachmentLocation): void {
        if (this.attachments[location]) {
            let attachment: ShipAttachment = this.attachments[location];
            this.attachments[location] = null;
            this.ship.getGameObject().remove(attachment.getGameObject(), false);
            attachment.detach();

            // move attachment to ship location and rotation and apply current velocity
            let shipRealLocation: Phaser.Math.Vector2 = this.ship.getRealLocation();
            let newLocation: Phaser.Math.Vector2 = shipRealLocation;
            attachment.getGameObject().setPosition(newLocation.x, newLocation.y);
            let shipVelocityVector: Phaser.Math.Vector2 = this.ship.getVelocity();
            attachment.getPhysicsBody().velocity = shipVelocityVector;
            attachment.getPhysicsBody().rotation += this.ship.getRotation();
        }
    }
    
    throwAttachment(location: AttachmentLocation): void {
        let attachment: ShipAttachment = this.getAttachment(location);
        if (attachment) {
            this.removeAttachment(location);
            attachment.isThrown = true;
            let heading = attachment.getHeading();
            let deltaV: Phaser.Math.Vector2 = heading.multiply(new Phaser.Math.Vector2(Constants.THROW_FORCE, Constants.THROW_FORCE));
            // add throw force to current velocity
            attachment.getPhysicsBody().velocity.add(deltaV);
        }
    }
    
    getAttachments(): ShipAttachment[] {
        return this.attachments;
    }
    
    getAttachment(location: AttachmentLocation): ShipAttachment {
        return this.attachments[location];
    }

    private updateAttachmentAngles(): void {
        let angle: number = 360 / 8;
        for (var i=0; i<this.attachments.length; i++) {
            let att: ShipAttachment = this.attachments[i];
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
                att.getGameObject().angle = rot;
            }
        }
    }
}