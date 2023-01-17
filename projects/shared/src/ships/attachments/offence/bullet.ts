import { HasGameObject } from "../../../interfaces/has-game-object";
import { HasLocation } from "../../../interfaces/has-location";
import { Helpers } from "../../../utilities/helpers";
import { Ship } from "../../ship";
import { Constants } from "../../../utilities/constants";
import { Weapons } from "./weapons";
import { GameScoreTracker } from "../../../utilities/game-score-tracker";
import { Exploder } from "../../../utilities/exploder";
import { BaseScene } from "../../../scenes/base-scene";

export type BulletOptions = {
    readonly location: Phaser.Math.Vector2;
    readonly weapon: Weapons;
    /**
     * an implementation of the `Exploder` abstract class to be used on collision
     */
    readonly exploder: Exploder;
    /**
     * the force imparted on the bullet when fired. larger numbers
     * travel faster
     */
    readonly force?: number;
    /**
     * amount of damage this bullet causes if it hits a target
     */
    readonly damage?: number;
    readonly angle?: number;
    readonly startingV?: Phaser.Math.Vector2;
    /**
     * the size of this bullet
     */
    readonly radius?: number;
    /**
     * number of milliseconds before the bullet self-destructs
     * after being fired
     */
    readonly timeout?: number;
    /**
     * how much influence the impact will have on targets
     */
    readonly mass?: number;
};

export class Bullet implements BulletOptions, HasGameObject<Phaser.GameObjects.Container>, HasLocation {
    readonly id: string;
    readonly scene: BaseScene;
    readonly force: number;
    readonly damage: number;
    readonly radius: number;
    readonly weapon: Weapons;
    readonly timeout: number;
    readonly mass: number;
    readonly exploder: Exploder;

    active: boolean;

    private _startLoc: Phaser.Math.Vector2;
    private _gameObj: Phaser.GameObjects.Container;
    
    constructor(scene: BaseScene, options: BulletOptions) {
        this.id = Phaser.Math.RND.uuid();
        this.active = true;
        this.scene = scene;
        this._startLoc = options.location || Helpers.vector2();
        this.weapon = options.weapon;
        this.force = options.force ?? 1;
        this.damage = options.damage ?? 1;
        this.radius = options.radius ?? 5;
        this.timeout = options.timeout ?? 500;
        this.mass = options.mass ?? 0;
        this.exploder = options.exploder;
        
        this._createGameObj();

        const startingA: number = options.angle ?? 0;
        this.getGameObject().setAngle(startingA);
        const startingV: Phaser.Math.Vector2 = options.startingV || Phaser.Math.Vector2.ZERO;
        this.getPhysicsBody().setVelocity(startingV.x, startingV.y);
        this.getPhysicsBody().setBounce(0, 0);
        this.addCollisionDetection();

        GameScoreTracker.shotFired(this.weapon.ship.id);
        this._setInMotion();
    }

    get location(): Phaser.Math.Vector2 {
        return this.getLocation();
    }

    onShipCollision(ship: Ship): void {
        this.destroy();
        if (ship.active) {
            GameScoreTracker.shotLanded(this.weapon.ship.id, ship.id, this.damage);
            let remainingIntegrity = ship.integrity - this.damage;
            if (remainingIntegrity < 0) {
                remainingIntegrity = 0;
            }
            GameScoreTracker.damageTaken(ship.id, remainingIntegrity);
            if (remainingIntegrity <= 0) {
                GameScoreTracker.opponentDestroyed(this.weapon.ship.id, ship.id);
            }
            ship.sustainDamage({
                amount: this.damage, 
                timestamp: this.scene.time.now,
                attackerId: this.weapon.ship.id,
                message: `projectile hit`
            });
        }
    }

    private addCollisionDetection(): void {
        this.scene.physics.add.collider(this.getGameObject(), this.scene.getLevel().getGameObject(), () => {
            this.destroy();
        });
        const dist = this.getRange();
        this.scene.getLevel().getActiveShipsWithinRadius(this.scene.getShips(), this.getLocation(), dist * 2)
            .forEach((opp: Ship) => {
                if (opp.id !== this.weapon.ship.id) {
                    this.scene.physics.add.collider(this.getGameObject(), opp.getGameObject(), () => {
                        this.onShipCollision(opp);
                    });
                }
            });
    }

    getGameObject(): Phaser.GameObjects.Container {
        return this._gameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return this.getGameObject()?.body as Phaser.Physics.Arcade.Body;
    }

    getRotation(): number {
        return this.getGameObject()?.angle || 0;
    }

    setRotation(degrees: number): void {
        this.getGameObject()?.setAngle(degrees);
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
        let cameraPos: Phaser.Math.Vector2 = this.scene.cameras.main.getWorldPoint(0, 0);
        let loc: Phaser.Math.Vector2 = this.getLocation();
        return new Phaser.Math.Vector2(loc.x - cameraPos.x, loc.y - cameraPos.y);
    }

    setLocationInView(location: Phaser.Types.Math.Vector2Like): void {
        throw new Error('Bullet.setLocationInView(...) is not supported');
    }

    getLocation(): Phaser.Math.Vector2 {
        const go = this.getGameObject();
        return Helpers.vector2(go?.x ?? 0, go?.y ?? 0);
    }

    setLocation(location: Phaser.Math.Vector2): void {
        const go: Phaser.GameObjects.Container = this.getGameObject();
        go?.setPosition(location.x, location.y);
    }

    getRange(): number {
        return this.force * (this.timeout / 1000);
    }

    destroy() {
        this.getGameObject()?.setActive(false);
        this.getGameObject()?.destroy();
    }

    private _setInMotion(): void {
        let heading: Phaser.Math.Vector2 = this.getHeading();
        // add force to heading
        let deltaV: Phaser.Math.Vector2 = heading.multiply(Helpers.vector2(this.force));
        // add deltaV to current Velocity
        this.getPhysicsBody().velocity.add(deltaV);
        // ensure bullet is destroyed after `timeout` milliseconds if no collisions
        window.setTimeout(() => this.destroy(), this.timeout);
    }

    private _createGameObj(): void {
        this._gameObj = this.scene.add.container(0, 0);
        this._gameObj.setSize(this.radius * 2, this.radius * 2);
        this.setLocation(this._startLoc);
        
        this.scene.physics.add.existing(this._gameObj);
        this.getPhysicsBody().setMass(this.mass);
        this.getPhysicsBody().setCircle(this.radius);
    }
}