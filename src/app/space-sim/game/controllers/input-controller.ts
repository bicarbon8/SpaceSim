import { Updatable } from "../interfaces/updatable";
import { ShipPod } from "../ships/ship-pod";
import { SpaceSim } from "../space-sim";

export abstract class InputController implements Updatable {
    private _scene: Phaser.Scene;
    private _player: ShipPod;
    
    active: boolean;

    constructor(scene: Phaser.Scene, player?: ShipPod) {
        this._scene = scene;
        this._player = player;
        this.active = true;
    }

    get game(): Phaser.Game {
        return this.scene?.game;
    }

    get scene(): Phaser.Scene {
        return this._scene;
    }

    get player(): ShipPod {
        return this._player || SpaceSim.player;
    }

    set player(player: ShipPod) {
        this._player = player;
    }

    abstract update(time: number, delta: number): void;
}