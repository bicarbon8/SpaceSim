import "phaser";
import { Updatable } from "../interfaces/updatable";
import { CanTarget } from "../interfaces/can-target";
import { CanThrust } from "../interfaces/can-thrust";
import { HasLocation } from "../interfaces/has-location";
import { HasGameObject } from "../interfaces/has-game-object";
import { HasIntegrity } from "../interfaces/has-integrity";
import { ShipAttachment } from "./attachments/ship-attachment";
import { HasAttachments } from "../interfaces/has-attachments";
import { AttachmentLocation } from "./attachments/attachment-location";
import { HasTemperature } from "../interfaces/has-temperature";
import { HasFuel } from "../interfaces/has-fuel";
export declare class ShipPod implements Updatable, CanTarget, CanThrust, HasLocation, HasGameObject, HasIntegrity, HasAttachments, HasTemperature, HasFuel {
    private id;
    private scene;
    private gameObj;
    private target;
    private integrity;
    private attachments;
    private thrustKey;
    private boostKey;
    private rotateAttachmentsClockwiseKey;
    private rotateAttachmentsAntiClockwiseKey;
    private detachAttachmentKey;
    private remainingFuel;
    private temperature;
    private thrusterParticles;
    active: boolean;
    constructor(scene: Phaser.Scene);
    update(): void;
    private updateAttachments;
    private setupInputHandlers;
    /**
     * checks for and applies damage based on degrees over safe temperature at a rate
     * defined by {Constants.OVERHEAT_CHECK_INTERVAL} milliseconds between each check.
     * also applies cooling at a rate of {Constants.COOLING_RATE}
     */
    private checkOverheatCondition;
    private lastOverheatCheck;
    /**
     * TODO: needed so we can use Floating Origin
     */
    getRealLocation(): Phaser.Math.Vector2;
    /**
     * the location within the viewable area
     * @returns a {Phaser.Math.Vector2} offset for location within current
     * viewable area
     */
    getLocation(): Phaser.Math.Vector2;
    getId(): string;
    getGameObject(): Phaser.GameObjects.GameObject;
    setTarget(target: HasLocation): void;
    lookAtTarget(): void;
    getAngle(): number;
    getRotation(): number;
    getHeading(): Phaser.Math.Vector2;
    getVelocity(): number;
    thrustFowards(): void;
    boostForwards(): void;
    private lastBoostTime;
    private applyThrust;
    private displayThrusterFire;
    strafeLeft(): void;
    strafeRight(): void;
    thrustBackwards(): void;
    getTemperature(): number;
    applyHeating(degrees: number): void;
    applyCooling(degrees: number): void;
    reduceFuel(amount: number): void;
    addFuel(amount: number): void;
    getRemainingFuel(): number;
    getIntegrity(): number;
    sustainDamage(amount: number): void;
    repair(amount: number): void;
    rotateAttachmentsClockwise(): void;
    rotateAttachmentsAntiClockwise(): void;
    private updateAttachmentPositions;
    /**
     * adds the passed in {ShipAttachment} in {AttachmentLocation.front} or
     * the first open {AttachmentLocation} in a clockwise search. if no open
     * slots exist then the existing {ShipAttachment} at {AttachmentLocation.front}
     * is detached and replaced with the passed in {ShipAttachment}
     * @param attachment the attachment to be added
     */
    addAttachment(attachment: ShipAttachment): void;
    removeAttachment(location: AttachmentLocation): void;
    getAttachments(): ShipAttachment[];
    destroy(): void;
}
