import { HasGameObject } from "../../../interfaces/has-game-object";
import { BulletOptions } from "../../../interfaces/bullet-options";
import { HasLocation } from "../../../interfaces/has-location";
import { Helpers } from "../../../utilities/helpers";

export class Bullet implements HasGameObject<Phaser.GameObjects.Sprite>, HasLocation {
    readonly id: string;
    private _scene: Phaser.Scene;
    private _force: number;
    private _gameObj: Phaser.GameObjects.Sprite;
    private _scale: number;

    active: boolean;
    
    constructor(scene: Phaser.Scene, options: BulletOptions) {
        this.id = Phaser.Math.RND.uuid();
        this.active = true;
        this._scene = scene;
        this._force = (options.force === undefined) ? 1 : options.force;
        this._scale = (options.scale === undefined) ? 1 : options.scale;
        
        this._createGameObj(options);

        this.getGameObject().angle = options.angle || 0;
        this.getPhysicsBody().velocity = options.startingV || Phaser.Math.Vector2.ZERO;
        this.addCollisionDetection();
        this._setInMotion();
    }

    private addCollisionDetection(): void {
        // TODO: setup collision detection with all walls and other ships
        // for (var i=0; i<Globals.interactables.length; i++) {
        //     this.scene.physics.add.collider(this.gameObj, Globals.interactables[i], this.onImpact);
        // }
    }

    private onImpact(bullet: Phaser.GameObjects.GameObject, target: Phaser.GameObjects.GameObject): void {
        // TODO: impart damage to target and destroy bullet
    }

    getGameObject(): Phaser.GameObjects.Sprite {
        return this._gameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return this.getGameObject()?.body as Phaser.Physics.Arcade.Body;
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
        let cameraPos: Phaser.Math.Vector2 = this._scene.cameras.main.getWorldPoint(0, 0);
        let loc: Phaser.Math.Vector2 = this.getLocation();
        return new Phaser.Math.Vector2(loc.x - cameraPos.x, loc.y - cameraPos.y);
    }

    getLocation(): Phaser.Math.Vector2 {
        if (this.getGameObject()) {
            return Helpers.vector2(this.getGameObject().x, this.getGameObject().y);
        }
        return Helpers.vector2();
    }

    setLocation(location: Phaser.Math.Vector2): void {
        let go: Phaser.GameObjects.Sprite = this.getGameObject();
        if (go) {
            go.x = location.x;
            go.y = location.y;
        }
    }

    private _setInMotion(): void {
        let heading: Phaser.Math.Vector2 = this.getHeading();
        // add force to heading
        let deltaV: Phaser.Math.Vector2 = heading.multiply(Helpers.vector2(this._force));
        // add deltaV to current Velocity
        this.getPhysicsBody().velocity.add(deltaV);
    }

    private _createGameObj(options: BulletOptions): void {
        this._gameObj = this._scene.add.sprite(0, 0, options.spriteName);
        this.setLocation(options.location);
        this._gameObj.setScale(this._scale);
        this._scene.physics.add.existing(this._gameObj);
    }
}