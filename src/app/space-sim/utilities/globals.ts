import { ShipPod } from "../ships/ship-pod";

export module Globals {
    export var player: ShipPod;
    export var game: Phaser.Game;
    export var interactables: Phaser.GameObjects.GameObject[] = [];
    export var debug: boolean = false;
}