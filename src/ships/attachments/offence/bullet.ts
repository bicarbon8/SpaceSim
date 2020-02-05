import { HasGameObject } from "../../../interfaces/has-game-object";
import { BulletParameters } from "../../../interfaces/bullet-parameters";
import { HasLocation } from "../../../interfaces/has-location";
import { Globals } from "../../../utilities/globals";
import { HasPhysicsGameObject } from "../../../interfaces/has-physics-game-object";
import { Helpers } from "../../../utilities/helpers";

export class Bullet implements HasGameObject, HasPhysicsGameObject, HasLocation {
    scene: Phaser.Scene;
    force: number;
    gameObj: Phaser.Physics.Arcade.Sprite;
    active: boolean;

    constructor(scene: Phaser.Scene, params: BulletParameters) {
        this.scene = scene;
        this.force = params.force || 0;
        this.gameObj = scene.physics.add.sprite(params.x || 0, params.y || 0, 'bullet');
        this.gameObj.setAngle(params.angle || 0);
        this.active = true;
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

    getGameObject(): Phaser.GameObjects.GameObject {
        return this.gameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        if (this.getGameObject()) {
            return this.getGameObject().body as Phaser.Physics.Arcade.Body;
        }
    }

    getAngle(): number {
        return this.gameObj.angle;
    }

    getRotation(): number {
        return this.gameObj.rotation;
    }

    getHeading(): Phaser.Math.Vector2 {
        return Helpers.getHeading(this.getPhysicsBody());
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
        let go: Phaser.Physics.Arcade.Body = this.getPhysicsBody();
        return new Phaser.Math.Vector2(go.x - cameraPos.x, go.y - cameraPos.y);
    }

    getRealLocation(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.gameObj.x, this.gameObj.y);
    }

    private setInMotion(): void {
        let heading: Phaser.Math.Vector2 = this.getHeading();
        let deltaV: Phaser.Math.Vector2 = heading.multiply(new Phaser.Math.Vector2(this.force, this.force));
        this.gameObj.body.velocity.add(deltaV);
    }
}