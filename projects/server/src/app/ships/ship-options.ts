import Phaser from "phaser";
import { PhysicsObject } from "../interfaces/physics-object";

export type ShipOptions = Partial<PhysicsObject> & {
    readonly id?: string;
    readonly integrity?: number;
    readonly remainingFuel?: number;
    readonly remainingAmmo?: number;
    readonly temperature?: number;
    readonly mass?: number;
    readonly weaponsKey?: number;
    readonly wingsKey?: number;
    readonly cockpitKey?: number;
    readonly engineKey?: number;
}