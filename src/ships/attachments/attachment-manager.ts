import { HasAttachments } from "../../interfaces/has-attachments";
import { ShipAttachment } from "./ship-attachment";
import { Helpers } from "../../utilities/helpers";
import { AttachmentLocation } from "./attachment-location";
import { Updatable } from "../../interfaces/updatable";
import { ShipPod } from "../ship-pod";

export class AttachmentManager implements HasAttachments, Updatable {
    private attachments: ShipAttachment[] = [];
    private ship: ShipPod;

    active: boolean;

    constructor(parent: ShipPod) {
        this.active = true;
        this.ship = parent;
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
        let last: ShipAttachment = this.attachments.pop(); // remove last element
        this.attachments.unshift(last); // push last element onto start of array
        this.updateAttachmentPositions();
    }
    
    rotateAttachmentsAntiClockwise(): void {
        let first: ShipAttachment = this.attachments.shift(); // remove first element
        this.attachments.push(first); // push first element onto end of array
        this.updateAttachmentPositions();
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
        for (var i=0; i<this.attachments.length; i++) {
            if (this.attachments[i]) {
                this.attachments[i].setAttachmentLocation(i);
            }
        }
    }
}