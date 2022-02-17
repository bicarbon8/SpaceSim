import { HasLocation } from "../interfaces/has-location";

export interface ShipPodOptions {
    scene: Phaser.Scene;
    id?: string;
    location?: Phaser.Math.Vector2;
    target?: HasLocation;
    integrity?: number;
    remainingFuel?: number;
    temperature?: number;
}