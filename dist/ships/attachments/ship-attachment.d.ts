import { ShipPod } from "../ship-pod";
import { HasGameObject } from "../../interfaces/has-game-object";
import { Updatable } from "../../interfaces/updatable";
import { HasLocation } from "../../interfaces/has-location";
import { HasIntegrity } from "../../interfaces/has-integrity";
import { AttachmentLocation } from "./attachment-location";
import { HasPhysicsGameObject } from "../../interfaces/has-physics-game-object";
export declare abstract class ShipAttachment implements Updatable, HasGameObject, HasPhysicsGameObject, HasLocation, HasIntegrity {
    protected ship: ShipPod;
    protected scene: Phaser.Scene;
    protected gameObj: Phaser.Physics.Arcade.Sprite;
    protected integrity: number;
    protected attachmentLocation: AttachmentLocation;
    protected isThrown: boolean;
    active: boolean;
    constructor(scene: Phaser.Scene);
    attach(ship: ShipPod, location?: AttachmentLocation): void;
    detach(): void;
    throw(): void;
    getGameObject(): Phaser.GameObjects.GameObject;
    getPhysicsBody(): Phaser.Physics.Arcade.Body;
    abstract update(): void;
    abstract trigger(): void;
    getRotation(): number;
    /**
     * returns a normalised {Phaser.Math.Vector2} representing
     * the direction this object would travel
     */
    getHeading(): Phaser.Math.Vector2;
    getSpeed(): number;
    getVelocity(): Phaser.Math.Vector2;
    getLocation(): Phaser.Math.Vector2;
    getRealLocation(): Phaser.Math.Vector2;
    getIntegrity(): number;
    sustainDamage(amount: number): void;
    repair(amount: number): void;
    destroy(): void;
    setAttachmentLocation(loc: AttachmentLocation): void;
}
