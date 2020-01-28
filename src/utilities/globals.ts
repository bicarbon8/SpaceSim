import { ShipPod } from "../ships/ship-pod";
import { Mouse } from "./mouse";

export module Globals {
    export var isPaused: boolean;
    export var player: ShipPod;
    export var mouse: Mouse;
    export var game: Phaser.Game;
}