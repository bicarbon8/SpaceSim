export module Constants {
    export module Ship {
        export const MAX_INTEGRITY: number = 100;
        export const MAX_FUEL: number = 100;
        export const MAX_SAFE_TEMPERATURE: number = 50;
        export const MAX_TEMPERATURE: number = 100;
        export const MAX_VELOCITY: number = 500;
        export const COOLING_RATE_PER_SECOND: number = 2; // degrees per second

        export module Attachments {
            export const THROW_FORCE: number = 100;
            export module Utility {
                export module Thruster {
                    export const FORCE: number = 50;
                    export const FUEL_PER_USE: number = 0.001; // units
                    export const HEAT_PER_USE: number = 0.2; // degree
                    export const USAGE_DELAY_MS: number = 100; 
                }
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
                    export module WALL {
                        export const TOP_LEFT = 12;
                        export const TOP_RIGHT = 12;
                        export const BOTTOM_RIGHT = 12;
                        export const BOTTOM_LEFT = 12;
                        // Let's add some randomization to the walls while we are refactoring:
                        export const TOP = [{ index: 6, weight: 4 }, { index: [11, 9, 10], weight: 1 }];
                        export const LEFT = [{ index: 6, weight: 4 }, { index: [11, 9, 10], weight: 1 }];
                        export const RIGHT = [{ index: 6, weight: 4 }, { index: [11, 9, 10], weight: 1 }];
                        export const BOTTOM = [{ index: 6, weight: 4 }, { index: [11, 9, 10], weight: 1 }];
                    }
                    // FLOOR: [{ index: 7, weight: 1 }, { index: 0, weight: 9 }],
                    export const FLOOR = [{ index: 0, weight: 10 }];
                    export module DOOR {
                        export const TOP = [0];
                        // prettier-ignore
                        export const LEFT = [0];
                        export const BOTTOM = [0];
                        // prettier-ignore
                        export const RIGHT = [0];
                    }
                }
            }
        }
    }
    export module Events {
        export const PLAYER_DEATH: string = 'player-death';
    }
}