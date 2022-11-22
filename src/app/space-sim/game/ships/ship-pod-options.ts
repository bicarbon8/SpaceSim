import { HasLocation } from "../interfaces/has-location";

export interface ShipPodOptions {
    readonly scene: Phaser.Scene;
    readonly id?: string;
    location?: Phaser.Math.Vector2;
    target?: HasLocation;
    integrity?: number;
    remainingFuel?: number;
    temperature?: number;
    readonly mass?: number;
}