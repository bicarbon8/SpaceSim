import { HasGameObject } from "../../../interfaces/has-game-object";
import { BulletParameters } from "../../../interfaces/bullet-parameters";
import { HasLocation } from "../../../interfaces/has-location";
import { HasPhysicsGameObject } from "../../../interfaces/has-physics-game-object";
export declare class Bullet implements HasGameObject, HasPhysicsGameObject, HasLocation {
    scene: Phaser.Scene;
    force: number;
    gameObj: Phaser.Physics.Arcade.Sprite;
    active: boolean;
    constructor(scene: Phaser.Scene, params: BulletParameters);
    private addCollisionDetection;
    private onImpact;
    getGameObject(): Phaser.GameObjects.GameObject;
    getPhysicsBody(): Phaser.Physics.Arcade.Body;
    getAngle(): number;
    getRotation(): number;
    getHeading(): Phaser.Math.Vector2;
    getSpeed(): number;
    getVelocity(): Phaser.Math.Vector2;
    getLocation(): Phaser.Math.Vector2;
    getRealLocation(): Phaser.Math.Vector2;
    private setInMotion;
}
