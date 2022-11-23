import { HasGameObject } from "../interfaces/has-game-object";
import { Updatable } from "../interfaces/updatable";
import { Constants } from "../utilities/constants";
import { Helpers } from "../utilities/helpers";
import { StellarBodyOptions } from "./stellar-body-options";

export class StellarBody implements Updatable, HasGameObject<Phaser.GameObjects.Sprite> {
    readonly id: string;
    active: boolean;

    private _scene: Phaser.Scene;
    private _gameObj: Phaser.GameObjects.Sprite;
    private _rotationSpeed: number; // in degrees per second
    
    constructor(scene: Phaser.Scene, options: StellarBodyOptions) {
        this.id = Phaser.Math.RND.uuid();
        this.active = true;
        this._scene = scene;
        this._rotationSpeed = options.rotationSpeed ?? Phaser.Math.RND.between(0.1, 1);
        
        this._createGameObj(options);
    }

    update(time: number, delta: number): void {
        if (this.active) {
            let go: Phaser.GameObjects.Sprite = this.getGameObject();
            if (go) {
                go.angle += this._rotationSpeed / delta;
                if (go.angle >= 360) {
                    go.angle = 0;
                }
            }
        }
    }

    getRotation(): number {
        return this.getGameObject()?.angle || 0;
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

    getGameObject(): Phaser.GameObjects.Sprite {
        return this._gameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return undefined;
    }

    private _createGameObj(options: StellarBodyOptions): void {
        options.location ??= Helpers.vector2();
        options.scale ??= Phaser.Math.RND.realInRange(0.1, 3);
        options.scrollFactor ??= Phaser.Math.RND.realInRange(0.05, 0.5);

        this._gameObj = this._scene.add.sprite(options.location.x, options.location.y, options.spriteName);
        this._gameObj.setScale(options.scale, options.scale);
        this._gameObj.setScrollFactor(options.scrollFactor);
        this._gameObj.setDepth(Constants.UI.Layers.STELLAR);
        if (options.spriteName === 'sun') {
            this._gameObj.setDepth(this._gameObj.depth - 0.2); // ensure Sun is behind planets always
        }
        if (options.spriteName === 'venus') {
            this._gameObj.setDepth(this._gameObj.depth - 0.1); // ensure Venus is behind rocky planets
        }
    }
}