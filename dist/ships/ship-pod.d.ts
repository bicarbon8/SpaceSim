import { Vector, Bodies } from "matter-js";
export declare class ShipPod {
    private id;
    obj: Bodies;
    fuelCapacity: number;
    remainingFuel: number;
    thrust: number;
    rotationRate: number;
    integrity: number;
    mass: number;
    temperature: number;
    position: Vector;
    private heading;
    private movement;
    constructor();
    getId(): string;
    activateThruster(): ShipPod;
}
