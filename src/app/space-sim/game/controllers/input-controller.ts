import { HasGameObject } from "../interfaces/has-game-object";
import { Updatable } from "../interfaces/updatable";
import { Ship } from "../ships/ship";
import { SpaceSim } from "../space-sim";

export abstract class InputController implements Updatable, HasGameObject<Phaser.GameObjects.Container> {
    private _scene: Phaser.Scene;
    private _player: Ship;
    
    active: boolean;

    constructor(scene: Phaser.Scene, player?: Ship) {
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

    get player(): Ship {
        return this._player || SpaceSim.player;
    }

    set player(player: Ship) {
        this._player = player;
    }

    abstract update(time: number, delta: number): void;
    abstract getGameObject(): Phaser.GameObjects.Container;
}