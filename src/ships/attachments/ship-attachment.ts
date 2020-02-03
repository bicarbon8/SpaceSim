import { ShipPod } from "../ship-pod";
import { HasGameObject } from "../../interfaces/has-game-object";
import { Updatable } from "../../interfaces/updatable";
import { HasLocation } from "../../interfaces/has-location";
import { HasIntegrity } from "../../interfaces/has-integrity";
import { Constants } from "../../utilities/constants";
import { AttachmentLocation } from "./attachment-location";

export abstract class ShipAttachment implements Updatable, HasGameObject, HasLocation, HasIntegrity {
    protected ship: ShipPod;
    protected scene: Phaser.Scene;
    protected gameObj: Phaser.Physics.Arcade.Sprite;
    protected integrity: number;
    protected attachmentLocation: AttachmentLocation;

    active: boolean;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.active = true;
        this.integrity = Constants.MAX_INTEGRITY;
    }

    attach(ship: ShipPod, location?: AttachmentLocation): void {
        if (!location) {
            location = AttachmentLocation.front;
        }
        this.ship = ship;
        this.setAttachmentLocation(location);
        let centre: Phaser.Math.Vector2 = this.ship.getRealLocation();
        this.gameObj.setPosition(centre.x, centre.y); // centre on ship location
        this.gameObj.setRotation(this.ship.getAngle()); // set heading to match ship
        let heading: Phaser.Math.Vector2 = this.getHeading();
        heading.multiply(new Phaser.Math.Vector2(0, 0));
        let loc: Phaser.Math.Vector2 = this.getRealLocation();
        loc.add(heading);
        this.gameObj.setPosition(loc.x, loc.y);
    }

    detach(): void {
        this.ship = null;
        this.attachmentLocation = null;
    }
    
    getGameObject(): Phaser.GameObjects.GameObject {
        return this.gameObj;
    }

    abstract update(): void;

    abstract trigger(): void;

    getAngle(): number {
        let angle: number = this.gameObj.angle;
        if (this.ship) {
            angle += this.ship.getAngle();
        }
        return angle;
    }

    getRotation(): number {
        let rotation: number = this.gameObj.rotation;
        if (this.ship) {
            rotation += this.ship.getRotation();
        }
        return rotation;
    }

    /**
     * returns a normalised {Phaser.Math.Vector2} representing 
     * the direction this object would travel
     */
    getHeading(): Phaser.Math.Vector2 {
        let x: number = Math.cos(this.getRotation());
        let y: number = Math.sin(this.getRotation());
        return new Phaser.Math.Vector2(x, y).normalize().negate();
    }

    getVelocity(): number {
        let velocity: number = this.gameObj.body.velocity.length();
        if (this.ship) {
            velocity += this.ship.getVelocity();
        }
        return velocity;
    }

    getLocation(): Phaser.Math.Vector2 {
        let cameraPos: Phaser.Math.Vector2 = this.scene.cameras.main.getWorldPoint(0, 0);
        let realLoc: Phaser.Math.Vector2 = this.getRealLocation();
        return new Phaser.Math.Vector2(realLoc.x - cameraPos.x, realLoc.y - cameraPos.y);
    }

    getRealLocation(): Phaser.Math.Vector2 {
        let realLocation: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.gameObj.x, this.gameObj.y);
        if (this.ship) {
            realLocation.add(this.ship.getRealLocation());
        }
        return realLocation;
    }

    getIntegrity(): number {
        return this.integrity;
    }

    sustainDamage(amount: number): void {
        this.integrity -= amount;
        if (this.integrity <= 0) {
            this.integrity = 0;
            this.active = false;
            // TODO: destroy attachment
        }
    }

    repair(amount: number): void {
        this.integrity = amount;
        if (this.integrity > Constants.MAX_INTEGRITY) {
            this.integrity = Constants.MAX_INTEGRITY;
        }
    }

    destroy(): void {
        this.active = false;
        this.ship.removeAttachment(this.attachmentLocation);
        // TODO: destroy attachment
    }

    setAttachmentLocation(loc: AttachmentLocation): void {
        this.attachmentLocation = loc;
    }
}