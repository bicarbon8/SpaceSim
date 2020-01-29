import "phaser";
import { Updatable } from "../interfaces/updatable";
import { CanTarget } from "../interfaces/can-target";
import { CanThrust } from "../interfaces/can-thrust";
import { HasLocation } from "../interfaces/has-location";
import { HasGameObject } from "../interfaces/has-game-object";
import { HasIntegrity } from "../interfaces/has-integrity";
import { ShipAttachment } from "./attachments/ship-attachment";
import { HasAttachments } from "../interfaces/has-attachments";
import { HasTemperature } from "../interfaces/has-temperature";
export declare class ShipPod implements Updatable, CanTarget, CanThrust, HasLocation, HasGameObject, HasIntegrity, HasAttachments, HasTemperature {
    private id;
    private scene;
    private gameObj;
    private target;
    private integrity;
    private attachments;
    private thrustKey;
    private rotateAttachmentsClockwiseKey;
    private rotateAttachmentsAntiClockwiseKey;
    private remainingFuel;
    private temperature;
    active: boolean;
    constructor(scene: Phaser.Scene);
    update(): void;
    private setupInputHandlers;
    /**
     * checks for and applies damage based on degrees over safe temperature at a rate
     * defined by {Constants.OVERHEAT_CHECK_INTERVAL} milliseconds between each check.
     * also applies cooling at a rate of {Constants.COOLING_RATE}
     */
    private checkOverheatCondition;
    /**
     * TODO: needed so we can use Floating Origin
     */
    getRealPosition(): Phaser.Math.Vector2;
    /**
     * the location within the viewable area
     * @returns a {Phaser.Math.Vector2} offset for location within current
     * viewable area
     */
    getPosition(): Phaser.Math.Vector2;
    getId(): string;
    getGameObject(): Phaser.GameObjects.GameObject;
    setTarget(target: HasLocation): void;
    lookAtTarget(): void;
    getHeading(): Phaser.Math.Vector2;
    thrustFowards(): void;
    strafeLeft(): void;
    strafeRight(): void;
    thrustBackwards(): void;
    applyHeating(degrees: number): void;
    applyCooling(degrees: number): void;
    reduceFuel(amount: number): void;
    getIntegrity(): number;
    sustainDamage(amount: number): void;
    repair(amount: number): void;
    rotateAttachmentsClockwise(): void;
    rotateAttachmentsAntiClockwise(): void;
    /**
     * replaces the attachment in {AttachmentLocation.front}
     * with the passed in {ShipAttachment}. if no attachment
     * in the {AttachmentLocation.front} slot then it is
     * simply added.
     * @param attachment the attachment to be added
     */
    addAttachment(attachment: ShipAttachment): void;
    destroy(): void;
}
