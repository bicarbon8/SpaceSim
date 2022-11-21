import { ShipPod } from "../ship-pod";
import { HasGameObject } from "../../interfaces/has-game-object";
import { Updatable } from "../../interfaces/updatable";
import { HasLocation } from "../../interfaces/has-location";
import { HasIntegrity } from "../../interfaces/has-integrity";
import { Constants } from "../../utilities/constants";
import { AttachmentLocation } from "./attachment-location";
import { Helpers } from "../../utilities/helpers";
import { DamageOptions } from "../damage-options";
import { ShipAttachmentOptions } from "./ship-attachment-options";
import { HasPhysicsBody } from "../../interfaces/has-physics-body";

export abstract class ShipAttachment implements Updatable, HasGameObject<Phaser.GameObjects.Sprite>, HasPhysicsBody, HasLocation, HasIntegrity {
    private _ship: ShipPod;
    private _scene: Phaser.Scene;
    private _attachmentLocation: AttachmentLocation;

    protected gameObj: Phaser.GameObjects.Sprite;
    protected integrity: number;
    
    isThrown: boolean;
    active: boolean;
    
    constructor(options: ShipAttachmentOptions) {
        this._scene = options.scene;
        this.integrity = options.integrity || Constants.MAX_INTEGRITY;
        this.isThrown = false;
        this.active = true;
    }

    get ship(): ShipPod {
        return this._ship;
    }

    get scene(): Phaser.Scene {
        return this._scene;
    }

    get attachmentLocation(): AttachmentLocation {
        return this._attachmentLocation;
    }

    attach(ship: ShipPod, location: AttachmentLocation = AttachmentLocation.front): void {
        if (this._ship) {
            this.detach();
        }
        this._ship = ship;
        this._attachmentLocation = location;
        this._ship.attachments.add(this.getGameObject());
    }

    detach(): void {
        let loc: Phaser.Math.Vector2 = this.ship.getLocation();
        this.ship.attachments.remove(this.getGameObject());
        this.getGameObject().setPosition(loc.x, loc.y);
        this._ship = null;
        this._attachmentLocation = null;
    }
    
    getGameObject(): Phaser.GameObjects.Sprite {
        return this.gameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return this.getGameObject()?.body as Phaser.Physics.Arcade.Body;
    }

    abstract update(time: number, delta: number): void;

    abstract trigger(): void;

    getRotation(): number {
        let rotation: number = this.getGameObject()?.angle;
        if (this.ship) {
            rotation += this.ship.attachments.angle;
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
        return Helpers.vector2();
    }

    getLocationInView(): Phaser.Math.Vector2 {
        let cameraPos: Phaser.Math.Vector2 = this.scene.cameras.main.getWorldPoint(0, 0);
        let realLoc: Phaser.Math.Vector2 = this.getLocation();
        return new Phaser.Math.Vector2(realLoc.x - cameraPos.x, realLoc.y - cameraPos.y);
    }

    getLocation(): Phaser.Math.Vector2 {
        let go: Phaser.GameObjects.Sprite = this.getGameObject();
        if (go) {
            let realLoc: Phaser.Math.Vector2 = new Phaser.Math.Vector2(go.x, go.y);
            if (this.ship) {
                realLoc.add(this.ship.getLocation());
            }
            return realLoc;
        }
        return Helpers.vector2();
    }

    setLocation(location: Phaser.Math.Vector2): void {
        this.getGameObject()?.setPosition(location.x, location.y);
    }

    getIntegrity(): number {
        return this.integrity;
    }

    sustainDamage(damageOpts: DamageOptions): void {
        this.integrity -= damageOpts.amount;
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
        this.ship.attachments.removeAttachmentAt(this.attachmentLocation);
        this.getGameObject().destroy();
    }
}