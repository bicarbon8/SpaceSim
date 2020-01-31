import { HasGameObject } from "../../../interfaces/has-game-object";
import { BulletParameters } from "../../../interfaces/bullet-parameters";
import { HasLocation } from "../../../interfaces/has-location";
export declare class Bullet implements HasGameObject, HasLocation {
    scene: Phaser.Scene;
    force: number;
    gameObj: Phaser.Physics.Arcade.Sprite;
    active: boolean;
    constructor(scene: Phaser.Scene, params: BulletParameters);
    private addCollisionDetection;
    private onImpact;
    getGameObject(): Phaser.GameObjects.GameObject;
    getAngle(): number;
    getHeading(): Phaser.Math.Vector2;
    getVelocity(): number;
    getLocation(): Phaser.Math.Vector2;
    getRealLocation(): Phaser.Math.Vector2;
    private setInMotion;
}
