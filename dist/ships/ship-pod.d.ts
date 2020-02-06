import "phaser";
import { Updatable } from "../interfaces/updatable";
import { CanTarget } from "../interfaces/can-target";
import { HasLocation } from "../interfaces/has-location";
import { HasGameObject } from "../interfaces/has-game-object";
import { HasIntegrity } from "../interfaces/has-integrity";
import { HasTemperature } from "../interfaces/has-temperature";
import { HasFuel } from "../interfaces/has-fuel";
import { HasPhysicsGameObject } from "../interfaces/has-physics-game-object";
import { AttachmentManager } from "./attachments/attachment-manager";
import { Thruster } from "./attachments/utility/thruster";
import { ShipPodConfig } from "./ship-pod-config";
export declare class ShipPod implements Updatable, CanTarget, HasLocation, HasGameObject<Phaser.GameObjects.Container>, HasPhysicsGameObject, HasIntegrity, HasTemperature, HasFuel {
    private id;
    private scene;
    private gameObj;
    private target;
    private integrity;
    private remainingFuel;
    private temperature;
    private flareParticles;
    private explosionParticles;
    active: boolean;
    attachments: AttachmentManager;
    thruster: Thruster;
    constructor(scene: Phaser.Scene, config?: ShipPodConfig);
    update(): void;
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
    getGameObject(): Phaser.GameObjects.Container;
    getPhysicsBody(): Phaser.Physics.Arcade.Body;
    setTarget(target: HasLocation): void;
    getTarget(): HasLocation;
    lookAtTarget(): void;
    /**
     * the rotation of the Ship's {GameObject.body} in degrees
     */
    getRotation(): number;
    getHeading(): Phaser.Math.Vector2;
    getSpeed(): number;
    getVelocity(): Phaser.Math.Vector2;
    getTemperature(): number;
    applyHeating(degrees: number): void;
    applyCooling(degrees: number): void;
    reduceFuel(amount: number): void;
    addFuel(amount: number): void;
    getRemainingFuel(): number;
    getIntegrity(): number;
    sustainDamage(amount: number): void;
    repair(amount: number): void;
    destroy(): void;
    private displayShipExplosion;
}
