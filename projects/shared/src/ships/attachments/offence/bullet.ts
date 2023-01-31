import { Ship } from "../../ship";
import { Weapon } from "./weapon";
import { BaseScene } from "../../../scenes/base-scene";
import { HasId } from "../../../interfaces/has-id";
import { HasLocation } from "../../../interfaces/has-location";
import { SpaceSim } from "../../../space-sim";
import { Helpers } from "../../../utilities/helpers";

export type BulletOptions = {
    readonly startingLoc: Phaser.Types.Math.Vector2Like;
    readonly weapon: Weapon;
    /**
     * the force imparted on the bullet when fired. larger numbers
     * travel faster
     */
    readonly force: number;
    /**
     * amount of damage this bullet causes if it hits a target
     */
    readonly damage: number;
    /**
     * amount of heat added to target on impact
     */
    readonly heat: number;
    readonly startingA: number;
    readonly startingV: Phaser.Types.Math.Vector2Like;
    /**
     * the size of this bullet
     */
    readonly radius: number;
    /**
     * number of milliseconds before the bullet self-destructs
     * after being fired
     */
    readonly timeout: number;
    /**
     * how much influence the impact will have on targets
     */
    readonly mass: number;
};

export class Bullet extends Phaser.GameObjects.Container implements BulletOptions, HasId, HasLocation {
    readonly id: string;
    readonly scene: BaseScene;
    readonly force: number;
    readonly damage: number;
    readonly heat: number;
    readonly radius: number;
    readonly weapon: Weapon;
    readonly timeout: number;
    readonly mass: number;
    readonly startingLoc: Phaser.Types.Math.Vector2Like;
    readonly startingA: number;
    readonly startingV: Phaser.Types.Math.Vector2Like;

    public body: Phaser.Physics.Arcade.Body;
    
    constructor(scene: BaseScene, options: BulletOptions) {
        super(scene, options.startingLoc?.x, options.startingLoc?.y);

        this.id = Phaser.Math.RND.uuid();
        this.weapon = options.weapon;
        this.force = options.force ?? 0;
        this.damage = options.damage ?? 0;
        this.heat = options.heat ?? 0;
        this.radius = options.radius ?? 0;
        this.timeout = options.timeout ?? 0;
        this.mass = options.mass ?? 0;
        this.startingLoc = options.startingLoc || Helpers.vector2();
        this.startingA = options.startingA ?? 0;
        this.startingV = options.startingV || Phaser.Math.Vector2.ZERO;
        
        this._createGameObj();

        SpaceSim.stats.shotFired(this.weapon.ship.id);

        this._setInMotion();
    }

    get location(): Phaser.Types.Math.Vector2Like {
        return {x: this.x, y: this.y};
    }

    /**
     * called when this bullet strikes a `Ship`
     * @param ship the ship this bullet hit
     */
    onShipCollision(ship: Ship): void {
        if (ship.active) {
            SpaceSim.stats.shotLanded(this.weapon.ship.id, ship.id, this.damage);
            let remainingIntegrity = ship.integrity - this.damage;
            if (remainingIntegrity < 0) {
                remainingIntegrity = 0;
            }
            if (remainingIntegrity <= 0) {
                SpaceSim.stats.opponentDestroyed(this.weapon.ship.id, ship.id);
            }
            ship.subtractIntegrity(this.damage, {
                timestamp: this.scene.time.now,
                attackerId: this.weapon.ship.id,
                message: `projectile hit`
            });
            ship.addHeat(this.heat);
            this.destroy();
        }
    }

    get heading(): Phaser.Math.Vector2 {
        return this.weapon.ship.heading;
    }

    get locationInView(): Phaser.Math.Vector2 {
        return Helpers.convertLocToLocInView({x: this.x, y: this.y}, this.scene);
    }

    get range(): number {
        return this.force * (this.timeout / 1000);
    }

    private _setInMotion(): void {
        let heading: Phaser.Math.Vector2 = this.heading;
        // add force to heading
        let deltaV: Phaser.Math.Vector2 = heading.multiply(Helpers.vector2(this.force));
        // add deltaV to current Velocity
        this.body.velocity.add(deltaV);

        // ensure bullet is destroyed after `timeout` milliseconds if no collisions
        window.setTimeout(() => this.destroy(), this.timeout);
    }

    private _createGameObj(): void {
        this.scene.add.existing(this);
        this.setSize(this.radius * 2, this.radius * 2);
        this.setPosition(this.startingLoc.x, this.startingLoc.y);
        this.setAngle(this.startingA);

        this.scene.physics.add.existing(this);
        this.body.setMass(this.mass);
        this.body.setCircle(this.radius);
        this.body.setVelocity(this.startingV.x, this.startingV.y);
        this.body.setBounce(1, 1);

        this._addCollisionDetection();
    }

    private _addCollisionDetection(): void {
        // collide with `GameLevel` walls
        this.scene.physics.add.collider(this, this.scene.getLevel().wallsLayer, () => {
            this.destroy();
        });
        // collide with ships within 2x distance possible to travel
        const dist = this.range;
        this.scene.getLevel()
            .getActiveShipsWithinRadius(this.location, dist * 2)
            .forEach((ship: Ship) => {
                if (ship.id !== this.weapon.ship.id) {
                    this.scene.physics.add.collider(this, ship, () => {
                        this.onShipCollision(ship);
                    });
                }
            });
    }
}