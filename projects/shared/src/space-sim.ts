import { GameScoreTracker } from "./utilities/game-score-tracker";
import { Sanitiser } from "./utilities/sanitiser";

export module SpaceSim {
    export var game: Phaser.Game;
    /**
     * if true, physics debug display will be enabled @default false
     */
    export var debug: boolean = false;
    /**
     * tracks all gameplay stats
     */
    export const stats = new GameScoreTracker();
    /**
     * a way of uniquely identifying a user
     */
    export type UserData = {
        name?: string;
        fingerprint: string;
    };
    export module UserData {
        /**
         * removes any disallowed characters from the passed in `UserData`
         * fields
         * @param data the `UserData` to be sanitised
         * @returns a `UserData` object with any disallowed characters removed
         * from the `name` and `fingerprint`
         */
        export function sanitise(data: UserData): UserData {
            return {
                fingerprint: Sanitiser.sanitise(data.fingerprint),
                name: Sanitiser.sanitise(data.name)
            } as const;
        }
        /**
         * verifies the passed in `UserData` object meets the requirements
         * after being sanitised
         * @param data the `UserData` object to be validated
         * @returns `true` if valid, otherwise `false`
         */
        export function isValid(data: UserData): boolean {
            if (data) {
                const sanitised = UserData.sanitise(data);
                if (!sanitised) return false;
                if (!sanitised.name || sanitised.name.length < 3) return false;
                if (!sanitised.fingerprint || sanitised.fingerprint.length < 5) return false;
                return true;
            }
            return false;
        }
    }
    /**
     * Constant values used in the SpaceSim game
     */
    export module Constants {
        export const GAME_NAME = 'space-sim';
        export module Ships {
            export const RADIUS = 16;
            export const MAX_INTEGRITY = 100;
            export const MAX_FUEL = 100;
            export const MAX_FUEL_PER_CONTAINER = 20;
            export const MAX_SAFE_TEMPERATURE = 50;
            export const MAX_TEMPERATURE = 100;
            export const MAX_SPEED = 500;
            export const COOLING_RATE_PER_SECOND = 2; // degrees per second
            export const BOUNCE = 1;
            export const WALL_BOUNCE_FACTOR = 0.2;
            export const MASS = 10;
            export const MIN_ROTATION_ANGLE = 1; // degrees
            export module Engines {
                export const FORCE = 50;
                export const FUEL_PER_USE = 0.1; // units
                export const HEAT_PER_USE = 0.2; // degree
                export const USAGE_DELAY_MS = 100;
            }
            export module Weapons {
                export const MAX_AMMO = 100;
                export const MAX_AMMO_PER_CONTAINER = 100;
            }
            export module Supplies {
                export const RADIUS = 16;
                export const BOUNCE = 1;
                export const WALL_BOUNCE_FACTOR = 0.5;
                export const MASS = 0;
            }
        }
        export module GameLevels {
            export module Tiles {
                // frame 0 is empty so don't use it for walls
                export const WALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
            }
        }
        export module Events {
            export const SHIP_DEATH = 'ship-death';
            export const WEAPON_FIRING = 'weapon-firing';
            export const ENGINE_ON = 'engine-on';
            export const SHIP_ANGLE = 'ship-angle';
        }
        export module Socket {
            export const MAX_USERS_PER_ROOM = 100;
            export const TOO_MANY_CONNECTIONS = 'too-many-connections';
            export const SET_PLAYER_DATA = 'set-player-data';
            export const JOIN_ROOM = 'join-room';
            export const REQUEST_MAP = 'get-map';
            export const UPDATE_MAP = 'update-map';
            export const REQUEST_SHIP = 'request-new-ship';
            export const SET_PLAYER_ID = 'set-player-id';
            export const UPDATE_PLAYERS = 'update-players';
            export const COMMAND_PLAYER = 'player-command';
            export const SHIP_DESTROYED = 'ship-destroyed';
            export const ENGINE_ON = 'engine-on';
            export const WEAPON_FIRING = 'weapon-firing';
            export const SET_PLAYER_ANGLE = 'set-player-angle';
            export const UPDATE_SUPPLIES = 'update-supplies';
            export const FLICKER_SUPPLIES = 'flicker-supplies';
            export const REMOVE_SUPPLIES = 'remove-supplies';
            export const UPDATE_STATS = 'update-stats';
            export const INVALID_USER_DATA = 'invalid-user-data';
            export const USER_ACCEPTED = 'user-accepted';
            export const INVALID_REQUEST = 'invalid-request';
        }
        export module Timing {
            export const HIGH_PRI_UPDATE_FREQ = 1000 / 60; // 60 fps
            export const MED_PRI_UPDATE_FREQ = 1000 / 30; // 30 fps
            export const LOW_PRI_UPDATE_FREQ = 1000 / 15; // 15 fps
            export const ULTRALOW_PRI_UPDATE_FREQ = 1000; // 1 fps
            export const DISCONNECT_TIMEOUT_MS = 30000; // 30 sec
        }
    }
}