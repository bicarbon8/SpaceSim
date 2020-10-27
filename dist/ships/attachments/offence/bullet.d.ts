import { HasGameObject } from "../../../interfaces/has-game-object";
import { BulletParameters } from "../../../interfaces/bullet-parameters";
import { HasLocation } from "../../../interfaces/has-location";
import { HasPhysicsGameObject } from "../../../interfaces/has-physics-game-object";
export declare class Bullet implements HasGameObject<Phaser.GameObjects.Sprite>, HasPhysicsGameObject, HasLocation {
    scene: Phaser.Scene;
    force: number;
    gameObj: Phaser.GameObjects.Sprite;
    active: boolean;
    scale: number;
    constructor(scene: Phaser.Scene, params: BulletParameters);
    private addCollisionDetection;
    private onImpact;
    getGameObject(): Phaser.GameObjects.Sprite;
    getPhysicsBody(): Phaser.Physics.Arcade.Body;
    getRotation(): number;
    getHeading(): Phaser.Math.Vector2;
    getSpeed(): number;
    getVelocity(): Phaser.Math.Vector2;
    getLocation(): Phaser.Math.Vector2;
    getRealLocation(): Phaser.Math.Vector2;
    private setInMotion;
}
