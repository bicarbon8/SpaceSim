import { Vector, Body } from "matter-js";
export declare class ShipPod {
    private id;
    obj: Body;
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
    getId(): string;
    lookAt(position: Vector): ShipPod;
    activateThruster(): ShipPod;
}
