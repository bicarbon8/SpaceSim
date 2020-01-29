export module Constants {
    export const MAX_INTEGRITY: number = 100;
    export const MAX_FUEL: number = 100;
    export const MAX_SAFE_TEMPERATURE: number = 100;
    export const MAX_TEMPERATURE: number = 200;
    export const OVERHEAT_CHECK_INTERVAL: number = 1000; // milliseconds
    export const COOLING_RATE: number = 0.1; // degrees per second
    export const FUEL_PER_THRUST: number = 0.01; // units
    export const HEAT_PER_THRUST: number = 0.5 // degrees
    export const THRUSTER_FORCE: number = 1;
}