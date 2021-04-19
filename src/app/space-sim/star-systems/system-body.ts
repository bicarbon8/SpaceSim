import { HasGameObject } from "../interfaces/has-game-object";
import { HasLocation } from "../interfaces/has-location";
import { Updatable } from "../interfaces/updatable";
import { ShipPod } from "../ships/ship-pod";
import { Helpers } from "../utilities/helpers";
import { SystemBodyOptions } from "./system-body-options";

export class SystemBody implements Updatable, HasLocation, HasGameObject<Phaser.GameObjects.Sprite> {
    readonly id: string;
    active: boolean;

    private _scene: Phaser.Scene;
    private _player: ShipPod;
    private _gameObj: Phaser.GameObjects.Sprite;
    private readonly _startLoc: Phaser.Math.Vector2;
    private readonly _playerStartLoc: Phaser.Math.Vector2;
    private _rotationSpeed: number;
    
    constructor(scene: Phaser.Scene, player: ShipPod, options: SystemBodyOptions) {
        this.id = Phaser.Math.RND.uuid();
        this.active = (options.startActive === false) ? false : true;
        this._scene = scene;
        this._player = player;
        this._playerStartLoc = this._player.getLocation();
        this._startLoc = options.startLocation || Helpers.vector2(
            Phaser.Math.RND.between(-Math.ceil(this._scene.game.canvas.width / 2), Math.ceil(this._scene.game.canvas.width / 2)),
            Phaser.Math.RND.between(-Math.ceil(this._scene.game.canvas.height / 2), Math.ceil(this._scene.game.canvas.height / 2))
        );
        this._rotationSpeed = (options.rotationSpeed === undefined) ? Phaser.Math.RND.between(0.0001, 0.0005) : options.rotationSpeed;

        this._createGameObj(options);
    }

    update(time: number, delta: number): void {
        if (this.active) {
            let go: Phaser.GameObjects.Sprite = this.getGameObject();
            if (go) {
                go.angle += this._rotationSpeed;
                if (go.angle >= 360) {
                    go.angle = 0;
                }

                // move the body in the opposite direction of travel at a rate of 1:500
                let pLoc0: Phaser.Math.Vector2 = this._playerStartLoc;
                let pLoc1: Phaser.Math.Vector2 = this._player?.getLocation() || Helpers.vector2();
                let pDelta: Phaser.Math.Vector2 = pLoc1.subtract(pLoc0);
                let scaled: Phaser.Math.Vector2 = pDelta.divide(Helpers.vector2(1.002, 1.002));

                go.x = this._startLoc.x + scaled.x;
                go.y = this._startLoc.y + scaled.y;
            }
        }
    }

    getRotation(): number {
        return this.getGameObject()?.angle || 0;
    }
    
    getHeading(): Phaser.Math.Vector2 {
        return Helpers.getHeading(this.getRotation());
    }
    
    getSpeed(): number {
        return this.getVelocity().length();
    }
    
    getVelocity(): Phaser.Math.Vector2 {
        return this.getPhysicsBody()?.velocity?.clone() || Helpers.vector2();
    }
    
    getLocationInView(): Phaser.Math.Vector2 {
        return Helpers.convertLocToLocInView(this.getLocation(), this._scene);
    }
    
    getLocation(): Phaser.Math.Vector2 {
        let go: Phaser.GameObjects.Sprite = this.getGameObject();
        if (go) {
            return Helpers.vector2(go.x, go.y);
        }
        return Phaser.Math.Vector2.ZERO;
    }

    setLocation(location: Phaser.Math.Vector2): void {
        let go: Phaser.GameObjects.Sprite = this.getGameObject();
        if (go) {
            go.x = location.x;
            go.y = location.y;
        }
    }

    getStartLocation(): Phaser.Math.Vector2 {
        return this._startLoc.clone();
    }

    getGameObject(): Phaser.GameObjects.Sprite {
        return this._gameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return this.getGameObject()?.body as Phaser.Physics.Arcade.Body;
    }

    private _createGameObj(options: SystemBodyOptions): void {
        this._gameObj = this._scene.add.sprite(this._startLoc.x, this._startLoc.y, options.spriteName);
    }
}