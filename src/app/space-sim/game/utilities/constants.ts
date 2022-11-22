export module Constants {
    export module Ship {
        export const MAX_INTEGRITY: number = 100;
        export const MAX_FUEL: number = 100;
        export const MAX_SAFE_TEMPERATURE: number = 50;
        export const MAX_TEMPERATURE: number = 100;
        export const MAX_VELOCITY: number = 500;
        export const COOLING_RATE_PER_SECOND: number = 2; // degrees per second
    }
    export const THRUSTER_FORCE_PER_SECOND: number = 500;
    export const THRUSTER_FUEL_PER_SECOND: number = 0.001; // units
    export const THRUSTER_HEAT_PER_SECOND: number = 1 // degrees
    export const BOOST_FORCE_PER_SECOND: number = 9999;
    export const BOOST_FUEL_PER_SECOND: number = 0.01; // units
    export const BOOST_HEAT_PER_SECOND: number = 10; // degrees
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