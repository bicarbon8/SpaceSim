import { ShipPod } from "../ship-pod";
import { HasGameObject } from "../../interfaces/has-game-object";
import { Updatable } from "../../interfaces/updatable";
import { HasLocation } from "../../interfaces/has-location";
import { HasIntegrity } from "../../interfaces/has-integrity";
import { Constants } from "../../utilities/constants";
import { AttachmentLocation } from "./attachment-location";
import { Helpers } from "../../utilities/helpers";
import { HasPhysicsGameObject } from "../../interfaces/has-physics-game-object";

export abstract class ShipAttachment implements Updatable, HasGameObject<Phaser.GameObjects.Sprite>, HasPhysicsGameObject, HasLocation, HasIntegrity {
    protected ship: ShipPod;
    protected scene: Phaser.Scene;
    protected gameObj: Phaser.GameObjects.Sprite;
    protected integrity: number;
    protected attachmentLocation: AttachmentLocation;
    
    isThrown: boolean;
    active: boolean;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.active = true;
        this.integrity = Constants.MAX_INTEGRITY;
        this.isThrown = false;
    }

    attach(ship: ShipPod, location: AttachmentLocation = AttachmentLocation.front): void {
        this.ship = ship;
        this.setAttachmentLocation(location);
        let centre: Phaser.Math.Vector2 = this.ship.getRealLocation();
        this.getPhysicsBody().position = centre; // centre on ship location
        this.getPhysicsBody().rotation = this.ship.getRotation(); // set heading to match ship
    }

    detach(): void {
        this.ship = null;
        this.attachmentLocation = null;
        let go: Phaser.GameObjects.GameObject = this.getGameObject();
        go.setActive(true);
        this.scene.add.existing(go);
    }
    
    getGameObject(): Phaser.GameObjects.Sprite {
        return this.gameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        let go: Phaser.GameObjects.Sprite = this.getGameObject();
        if (go) {
            return go.body as Phaser.Physics.Arcade.Body;
        }
        return null;
    }

    abstract update(): void;

    abstract trigger(): void;

    getRotation(): number {
        let rotation: number = this.getGameObject().angle;
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
        let rotation: number = this.getRotation();
        return Helpers.getHeading(rotation);
    }

    getSpeed(): number {
        let speed: number = this.getVelocity().length();
        if (this.ship) {
            speed += this.ship.getSpeed();
        }
        return speed;
    }

    getVelocity(): Phaser.Math.Vector2 {
        if (this.getPhysicsBody()) {
            let velocity: Phaser.Math.Vector2 = this.getPhysicsBody().velocity.clone();
            if (this.ship) {
                velocity.add(this.ship.getVelocity());
            }
            return velocity;
        }
        return Phaser.Math.Vector2.ZERO;
    }

    getLocation(): Phaser.Math.Vector2 {
        let cameraPos: Phaser.Math.Vector2 = this.scene.cameras.main.getWorldPoint(0, 0);
        let realLoc: Phaser.Math.Vector2 = this.getRealLocation();
        return new Phaser.Math.Vector2(realLoc.x - cameraPos.x, realLoc.y - cameraPos.y);
    }

    getRealLocation(): Phaser.Math.Vector2 {
        let go: Phaser.GameObjects.Sprite = this.getGameObject();
        if (go) {
            let realLoc: Phaser.Math.Vector2 = new Phaser.Math.Vector2(go.x, go.y);
            if (this.ship) {
                realLoc.add(this.ship.getRealLocation());
            }
            return realLoc;
        }
        return Phaser.Math.Vector2.ZERO;
    }

    getIntegrity(): number {
        return this.integrity;
    }

    sustainDamage(amount: number): void {
        this.integrity -= amount;
        if (this.integrity <= 0) {
            this.integrity = 0;
            this.active = false;
            this.destroy();
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
        this.ship.attachments.removeAttachment(this.attachmentLocation);
        this.getGameObject().destroy();
    }

    setAttachmentLocation(loc: AttachmentLocation): void {
        this.attachmentLocation = loc;
    }
}