import { ShipAttachment } from "../ship-attachment";
import { Constants } from "../../../utilities/constants";
import { Bullet, BulletOptions } from "./bullet";
import { BaseScene } from "../../../scenes/base-scene";

export type WeaponOptions = {
    maxAmmo?: number;
    firingDelay?: number;
    remainingAmmo?: number;
    heatPerShot?: number;
    bulletMass?: number;
    bulletRadius?: number;
    damagePerHit?: number;
    force?: number;
};

export abstract class Weapon extends ShipAttachment {
    private _maxAmmo: number;
    private _firingDelay: number;
    private _heatPerShot: number;
    private _lastFired: number;
    private _bulletMass: number;
    private _bulletScale: number;
    private _damagePerHit: number;
    private _force: number;

    public remainingAmmo: number;

    constructor(scene: BaseScene, options: WeaponOptions) {
        super(scene);
        this._lastFired = 0;

        this._maxAmmo = options.maxAmmo ?? Constants.Ship.Weapons.MAX_AMMO;
        this._firingDelay = options.firingDelay ?? 500;
        this.remainingAmmo = options.remainingAmmo ?? this._maxAmmo;
        this._heatPerShot = options.heatPerShot ?? 0.5;
        this._bulletMass = options.bulletMass ?? 0.01;
        this._bulletScale = options.bulletRadius ?? 1;
        this._damagePerHit = options.damagePerHit ?? 1;
        this._force = options.force ?? 500;
    }

    addAmmo(amount: number): this {
        this.remainingAmmo += amount;
        if (this.remainingAmmo > this._maxAmmo) {
            this.remainingAmmo = this._maxAmmo;
        }
        return this;
    }

    update(time: number, delta: number): void {
        if (this._canFire(time)) {
            this._fire();
            const heat = this._heatPerShot ?? 1;
            this.ship?.addHeat(heat);
            this._lastFired = time;
        }
    }

    getBullet(options: BulletOptions): Bullet {
        let bullet: Bullet;
        if (this.ship) {
            bullet = new Bullet(this.scene, options);
        }
        return bullet;
    }

    private _canFire(time: number): boolean {
        return this.enabled
            && this.ship != null
            && this.remainingAmmo > 0
            && time >= this._lastFired + this._firingDelay
            && !this.ship?.isOverheating;
    }

    private _fire(): void {
        this._lastFired = this.scene.time.now;

        const shipLoc = {x: this.ship.x, y: this.ship.y};
        const shipAngle = this.ship.rotationContainer.angle;
        const shipVel = this.ship.body.velocity.clone();
        const bulletOffset: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-20, 0).add(shipLoc);
        const adjustedLocation: Phaser.Math.Vector2 = Phaser.Math.RotateAround(bulletOffset, shipLoc.x, shipLoc.y, Phaser.Math.DegToRad(shipAngle));
        const opts: BulletOptions = {
            weapon: this,
            location: adjustedLocation,
            force: this._force,
            damage: this._damagePerHit,
            angle: shipAngle,
            startingV: shipVel,
            radius: this._bulletScale,
            mass: this._bulletMass
        };
        this.getBullet(opts);

        this.remainingAmmo--;
        const heat = this._heatPerShot ?? 1;
        this.ship?.addHeat(heat);
    }
}