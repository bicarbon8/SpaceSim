export module Constants {
    export const MAX_INTEGRITY: number = 100;
    export const MAX_FUEL: number = 100;
    export const MAX_SAFE_TEMPERATURE: number = 100;
    export const MAX_TEMPERATURE: number = 200;
    export const MAX_VELOCITY: number = 500;
    export const COOLING_RATE: number = 1; // degrees per second
    export const THRUSTER_FORCE: number = 10;
    export const THRUSTER_DELAY: number = 10; // milliseconds
    export const FUEL_PER_THRUST: number = 0.001; // units
    export const HEAT_PER_THRUST: number = 0.02 // degrees
    export const BOOSTER_FORCE: number = 50;
    export const FUEL_PER_BOOST: number = 0.01; // units
    export const HEAT_PER_BOOST: number = 0.1; // degrees
    export const BOOSTER_RECHARGE_TIME: number = 1000; // milliseconds
    export const THROW_FORCE: number = 100;
    export enum Flare {
        blue = 0,
        green = 1,
        red = 2,
        white = 3,
        yellow = 4
    }
    export const DEPTH_BACKGROUND = 0;
    export const DEPTH_STELLAR = 1;
    export const DEPTH_PLAYER = 2;
    export const DEPTH_HUD = 3;
    export const DEPTH_CONTROLS = 4;
    export const EVENT_PLAYER_DEATH: string = 'player-death';
}