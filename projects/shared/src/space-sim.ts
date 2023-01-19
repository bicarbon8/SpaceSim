import { Helpers } from "./utilities/helpers";

export module SpaceSim {
    export var game: Phaser.Game;
    /**
     * if true, physics debug display will be enabled @default false
     */
    export var debug: boolean = false;
    /**
     * the minimum level of logs that should be output @default 'warn'
     */
    export var loglevel: Helpers.LogLevel = 'warn';
}