import Phaser from "phaser";

export interface ShipOptions {
    readonly id?: string;
    readonly location?: Phaser.Math.Vector2;
    readonly velocity?: Phaser.Math.Vector2;
    readonly angle?: number;
    readonly integrity?: number;
    readonly remainingFuel?: number;
    readonly temperature?: number;
    readonly mass?: number;
    readonly weaponsKey?: number;
    readonly wingsKey?: number;
    readonly cockpitKey?: number;
    readonly engineKey?: number;
}