export module Constants {
    export module Ship {
        export const MAX_INTEGRITY: number = 100;
        export const MAX_FUEL: number = 100;
        export const MAX_SAFE_TEMPERATURE: number = 50;
        export const MAX_TEMPERATURE: number = 100;
        export const MAX_VELOCITY: number = 500;
        export const COOLING_RATE_PER_SECOND: number = 2; // degrees per second

        export module Attachments {
            export module Utility {
                export module Thruster {
                    export const FORCE: number = 50;
                    export const FUEL_PER_USE: number = 0.001; // units
                    export const HEAT_PER_USE: number = 0.5; // degree
                    export const USAGE_DELAY_MS: number = 100; 
                }
            }
        }
    }
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