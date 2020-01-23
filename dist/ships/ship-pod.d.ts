import { Vector, Body } from "matter-js";
import { Updatable } from "../interfaces/updatable";
export declare class ShipPod implements Updatable {
    private id;
    obj: Body;
    active: boolean;
    fuelCapacity: number;
    remainingFuel: number;
    thrust: number;
    thrusterFuelConsumption: number;
    thrusterHeatGeneration: number;
    rotationRate: number;
    integrity: number;
    temperature: number;
    realPosition: Vector;
    constructor();
    update(): void;
    getId(): string;
    lookAt(position: Vector): ShipPod;
    activateThruster(): ShipPod;
    applyCooling(): ShipPod;
}
