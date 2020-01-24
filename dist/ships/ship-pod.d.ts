import "phaser";
import { ShipPodConfig } from "./ship-pod-config";
export declare class ShipPod {
    private id;
    private config;
    private gameObj;
    active: boolean;
    fuelCapacity: number;
    remainingFuel: number;
    thrusterForce: number;
    thrusterFuelConsumption: number;
    thrusterHeatGeneration: number;
    rotationRate: number;
    integrity: number;
    temperature: number;
    realPosition: Phaser.Math.Vector2;
    constructor(config: ShipPodConfig);
    update(): void;
    getId(): string;
    lookAt(position: Phaser.Math.Vector2): void;
    activateThruster(): void;
    applyHeating(degrees: number): void;
    applyCooling(): void;
    integrityCheck(): void;
}
