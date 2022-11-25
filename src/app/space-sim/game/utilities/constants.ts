export module Constants {
    export module Ship {
        export const MAX_INTEGRITY = 100;
        export const MAX_FUEL = 100;
        export const MAX_FUEL_PER_CONTAINER = 20;
        export const MAX_SAFE_TEMPERATURE = 50;
        export const MAX_TEMPERATURE = 100;
        export const MAX_SPEED = 500;
        export const COOLING_RATE_PER_SECOND = 2; // degrees per second

        export module Attachments {
            export const THROW_FORCE = 100;
            export module Utility {
                export module Thruster {
                    export const FORCE = 50;
                    export const FUEL_PER_USE = 0.01; // units
                    export const HEAT_PER_USE = 0.2; // degree
                    export const USAGE_DELAY_MS = 100; 
                }
            }
            export module Offence {
                export const MAX_AMMO_PER_CONTAINER = 100;
            }
        }
    }
    export module UI {
        export module Layers {
            export const BACKGROUND = 0;
            export const STELLAR = 1;
            export const PLAYER = 2;
            export const HUD = 3;
        }
        export module SpriteMaps {
            export module Flares {
                export const blue = 0;
                export const green = 1;
                export const red = 2;
                export const white = 3;
                export const yellow = 4;
            }
            export module Tiles {
                export module Map {
                    // frame 0 is empty so don't use it for walls
                    export const WALL = [{ index: [1,2,3,4,5,6,7,8,9,10,11,12,13,14], weight: 1 }];
                }
            }
        }
    }
    export module Events {
        export const PLAYER_DEATH: string = 'player-death';
    }
}