import { HasGameObject } from "../../../interfaces/has-game-object";
import { BulletParameters } from "../../../interfaces/bullet-parameters";
import { HasLocation } from "../../../interfaces/has-location";
import { Globals } from "../../../utilities/globals";
import { HasPhysicsGameObject } from "../../../interfaces/has-physics-game-object";
import { Helpers } from "../../../utilities/helpers";

export class Bullet implements HasGameObject<Phaser.GameObjects.Sprite>, HasPhysicsGameObject, HasLocation {
    scene: Phaser.Scene;
    force: number;
    gameObj: Phaser.GameObjects.Sprite;
    active: boolean;
    scale: number;

    constructor(scene: Phaser.Scene, params: BulletParameters) {
        this.active = true;
        this.scene = scene;
        this.force = params.force || 0;
        this.gameObj = this.scene.add.sprite(params.x || 0, params.y || 0, 'bullet');
        this.gameObj.setScale(params.scale || 1, params.scale || 1);
        this.scene.physics.add.existing(this.gameObj);

        this.getGameObject().angle = params.angle || 0;
        this.getPhysicsBody().velocity = params.startingV || Phaser.Math.Vector2.ZERO;
        this.addCollisionDetection();
        this.setInMotion();
    }

    private addCollisionDetection(): void {
        for (var i=0; i<Globals.interactables.length; i++) {
            this.scene.physics.add.collider(this.gameObj, Globals.interactables[i], this.onImpact);
        }
    }

    private onImpact(bullet: Phaser.GameObjects.GameObject, target: Phaser.GameObjects.GameObject): void {
        // TODO: impart damage to target and destroy bullet
    }

    getGameObject(): Phaser.GameObjects.Sprite {
        return this.gameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        if (this.getGameObject()) {
            return this.getGameObject().body as Phaser.Physics.Arcade.Body;
        }
    }

    getRotation(): number {
        return this.getGameObject().angle;
    }

    getHeading(): Phaser.Math.Vector2 {
        return Helpers.getHeading(this.getRotation());
    }

    getSpeed(): number {
        return this.getVelocity().length();
    }

    getVelocity(): Phaser.Math.Vector2 {
        if (this.getPhysicsBody()) {
            return this.getPhysicsBody().velocity.clone();
        }
        return Phaser.Math.Vector2.ZERO;
    }

    getLocation(): Phaser.Math.Vector2 {
        let cameraPos: Phaser.Math.Vector2 = this.scene.cameras.main.getWorldPoint(0, 0);
        let loc: Phaser.Math.Vector2 = this.getRealLocation();
        return new Phaser.Math.Vector2(loc.x - cameraPos.x, loc.y - cameraPos.y);
    }

    getRealLocation(): Phaser.Math.Vector2 {
        if (this.getGameObject()) {
            return new Phaser.Math.Vector2(this.getGameObject().x, this.getGameObject().y);
        }
        return Phaser.Math.Vector2.ZERO;
    }

    private setInMotion(): void {
        let heading: Phaser.Math.Vector2 = this.getHeading();
        // add force to heading
        let deltaV: Phaser.Math.Vector2 = heading.multiply(Helpers.vector2(this.force));
        // add deltaV to current Velocity
        this.getPhysicsBody().velocity.add(deltaV);
    }
}