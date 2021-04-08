import { HasGameObject } from "../interfaces/has-game-object";
import { Updatable } from "../interfaces/updatable";
import { ShipPod } from "../ships/ship-pod";
import { Globals } from "./globals";

export abstract class InputController implements Updatable, HasGameObject<Phaser.GameObjects.Container> {
    private _scene: Phaser.Scene;
    private _player: ShipPod;
    private _container: Phaser.GameObjects.Container;

    active: boolean;

    constructor(scene: Phaser.Scene, player?: ShipPod) {
        this._scene = scene;
        this._player = player;
        this.active = true;

        this._createGameObj();
    }

    get game(): Phaser.Game {
        return this.scene?.game;
    }

    get scene(): Phaser.Scene {
        return this._scene;
    }

    get player(): ShipPod {
        return this._player || Globals.player;
    }

    abstract update(): void;
    
    getGameObject(): Phaser.GameObjects.Container {
        return this._container;
    }

    private _createGameObj(): void {
        this._container = this.scene.add.container();
    }
}