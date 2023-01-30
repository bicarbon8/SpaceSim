import { ShipAttachment } from "../ship-attachment";
import { Bullet, BulletOptions } from "./bullet";
import { BaseScene } from "../../../scenes/base-scene";
import { SpaceSim } from "../../../space-sim";
import { WeaponModel } from "./weapon-model";

export type WeaponOptions = {
    model: WeaponModel;
    maxAmmo: number;
    firingDelay: number;
    remainingAmmo?: number;
    heatPerShot: number;
    bulletMass?: number;
    bulletRadius: number;
    damagePerHit: number;
    heatPerHit: number;
    bulletTimeout: number;
    force: number;
};

export abstract class Weapon extends ShipAttachment {
    readonly model: WeaponModel;
    readonly maxAmmo: number;
    readonly firingDelay: number;
    readonly heatPerShot: number;
    readonly bulletMass: number;
    readonly bulletScale: number;
    readonly damagePerHit: number;
    readonly heatPerHit: number;
    readonly bulletTimeout: number;
    readonly force: number;

    public remainingAmmo: number;

    private _lastFired: number;

    constructor(scene: BaseScene, options: WeaponOptions) {
        super(scene);
        this._lastFired = 0;
        this.model = options.model ?? 'invalid';
        this.maxAmmo = options.maxAmmo ?? SpaceSim.Constants.Ships.Weapons.MAX_AMMO;
        this.firingDelay = options.firingDelay ?? Infinity;
        this.remainingAmmo = options.remainingAmmo ?? this.maxAmmo;
        this.heatPerShot = options.heatPerShot ?? Infinity;
        this.bulletMass = options.bulletMass ?? 0;
        this.bulletScale = options.bulletRadius ?? 1;
        this.damagePerHit = options.damagePerHit ?? 0;
        this.heatPerHit = options.heatPerHit ?? 0;
        this.bulletTimeout = options.bulletTimeout ?? 0;
        this.force = options.force ?? 500;
    }

    override setEnabled(enabled: boolean): void {
        super.setEnabled(enabled);
        let event: any;
        if (enabled) {
            event = SpaceSim.Constants.Events.WEAPON_ENABLED;
        } else {
            event = SpaceSim.Constants.Events.WEAPON_DISABLED;
        }
        this.scene.events.emit(event, this.ship.id);
    }

    addAmmo(amount: number): this {
        this.remainingAmmo += amount;
        if (this.remainingAmmo > this.maxAmmo) {
            this.remainingAmmo = this.maxAmmo;
        }
        return this;
    }

    update(time: number, delta: number): void {
        if (this._canFire(time)) {
            this._fire(time);
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
            && time >= this._lastFired + this.firingDelay
            && !this.ship?.isOverheating;
    }

    private _fire(time: number): void {
        this._lastFired = time;

        const shipLoc = {x: this.ship.x, y: this.ship.y};
        const shipAngle = this.ship.rotationContainer.angle;
        const shipVel = this.ship.body.velocity.clone();
        const opts: BulletOptions = {
            weapon: this,
            startingLoc: shipLoc,
            force: this.force,
            damage: this.damagePerHit,
            heat: this.heatPerHit,
            startingA: shipAngle,
            startingV: shipVel,
            radius: this.bulletScale,
            mass: this.bulletMass,
            timeout: this.bulletTimeout
        };
        this.getBullet(opts);

        this.remainingAmmo--;
        const heat = this.heatPerShot;
        this.ship?.addHeat(heat);
    }
}