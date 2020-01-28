import "phaser";
import { Updatable } from "../interfaces/updatable";
import { CanTarget } from "../interfaces/can-target";
import { CanThrust } from "../interfaces/can-thrust";
import { HasLocation } from "../interfaces/has-location";
import { HasGameObject } from "../interfaces/has-game-object";
export declare class ShipPod implements Updatable, CanTarget, CanThrust, HasLocation, HasGameObject {
    private id;
    private scene;
    private gameObj;
    private target;
    private inputKeys;
    active: boolean;
    fuelCapacity: number;
    remainingFuel: number;
    thrusterForce: number;
    thrusterFuelConsumption: number;
    thrusterHeatGeneration: number;
    rotationRate: number;
    integrity: number;
    temperature: number;
    constructor(scene: Phaser.Scene);
    update(): void;
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
    applyCooling(): void;
    reduceFuel(amount: number): void;
    integrityCheck(): void;
}
