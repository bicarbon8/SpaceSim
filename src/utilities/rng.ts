import { v4 } from "uuid";

export module RNG {
    export function int(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    export function guid(): string {
        return v4();
    }
}