import { ShipPod } from "../ships/ship-pod";

export module Globals {
    export var inputKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    export var mouseLocation: Phaser.Math.Vector2;
    export var isPaused: boolean;
    export var player: ShipPod;
}