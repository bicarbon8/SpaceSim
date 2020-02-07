import { HasAttachments } from "../../interfaces/has-attachments";
import { ShipAttachment } from "./ship-attachment";
import { Helpers } from "../../utilities/helpers";
import { AttachmentLocation } from "./attachment-location";
import { Updatable } from "../../interfaces/updatable";
import { ShipPod } from "../ship-pod";

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
            let last: ShipAttachment = this.attachments.pop(); // remove last element
            this.attachments.unshift(last); // push last element onto start of array
            this.updateAttachmentPositions();
            this.lastRotatedTime = this.scene.game.getTime();
        }
    }
    
    rotateAttachmentsAntiClockwise(): void {
        if (this.scene.game.getTime() > this.lastRotatedTime + this.rotationDelay) {
            let first: ShipAttachment = this.attachments.shift(); // remove first element
            this.attachments.push(first); // push first element onto end of array
            this.updateAttachmentPositions();
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
        let attached: boolean = false;
        for (var i=0; i<Helpers.enumLength(AttachmentLocation); i++) {
            if (!this.attachments[i]) {
                this.attachments[i] = attachment;
                attachment.attach(this.ship, i);
                attached = true;
                break;
            }
        }

        if (!attached) {
            // detach current front attachment
            this.attachments[AttachmentLocation.front].detach();
            this.attachments[AttachmentLocation.front] = attachment;
            attachment.attach(this.ship, AttachmentLocation.front);
        }

        this.ship.getGameObject().add(attachment.getGameObject());
    }
    
    removeAttachment(location: AttachmentLocation): void {
        if (this.attachments[location]) {
            let body: Phaser.Physics.Arcade.Body = this.attachments[location].getPhysicsBody();
            
            let go: Phaser.GameObjects.GameObject = this.attachments[location].getGameObject();
            this.ship.getGameObject().remove(go, false);
            this.attachments[location].detach();
            this.attachments[location] = null;

            // move attachment to ship location and rotation and apply current velocity
            body.position = this.ship.getRealLocation();
            let shipVelocityVector: Phaser.Math.Vector2 = this.ship.getPhysicsBody().velocity;
            body.setVelocity(shipVelocityVector.x, shipVelocityVector.y);
            body.rotation = this.ship.getRotation();
        }
    }
    
    throwAttachment(location: AttachmentLocation): void {
        let attachment: ShipAttachment = this.getAttachment(location);
        if (attachment) {
            for (var i=0; i<this.attachments.length; i++) {
                if (this.attachments[i] && this.attachments[i] == attachment) {
                    this.removeAttachment(i);
                    
                    attachment.throw();
                    break;
                }
            }
        }
    }
    
    getAttachments(): ShipAttachment[] {
        return this.attachments;
    }
    
    getAttachment(location: AttachmentLocation): ShipAttachment {
        return this.attachments[location];
    }

    private updateAttachmentPositions(): void {
        let angle: number = 360 / 8;
        for (var i=0; i<this.attachments.length; i++) {
            let att: ShipAttachment = this.attachments[i];
            if (att) {
                att.setAttachmentLocation(i);
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