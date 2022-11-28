import { CanShoot } from "../../../interfaces/can-shoot";
import { Ship } from "../../ship";
import { ShipAttachment } from "../ship-attachment";
import { Bullet } from "./bullet";

export type WeaponsOptions = {
    maxAmmo?: number;
    firingDelay?: number;
    remainingAmmo?: number;
    heatPerShot?: number;
    bulletMass?: number;
    bulletScale?: number;
    damagePerHit?: number;
    force?: number;
};

export abstract class Weapons extends ShipAttachment implements CanShoot {
    private _maxAmmo: number;
    private _firingDelay: number;
    private _remainingAmmo: number;
    private _heatPerShot: number;
    private _lastFired: number;
    private _isFiring: boolean;
    private _firingTimeout: number; // holds a window.setTimeout reference to un-trigger after 100ms
    private _bulletMass: number;
    private _bulletScale: number;
    private _damagePerHit: number;
    private _force: number;

    constructor(ship: Ship, options: WeaponsOptions) {
        super(ship);
        this._lastFired = 0;

        this._maxAmmo = options.maxAmmo ?? 100;
        this._firingDelay = options.firingDelay ?? 500;
        this._remainingAmmo = options.remainingAmmo ?? this._maxAmmo;
        this._heatPerShot = options.heatPerShot ?? 0.5;
        this._bulletMass = options.bulletMass ?? 0.01;
        this._bulletScale = options.bulletScale ?? 1;
        this._damagePerHit = options.damagePerHit ?? 1;
        this._force = options.force ?? 500;
    }

    get remainingAmmo(): number {
        return this._remainingAmmo;
    }

    addAmmo(amount: number): this {
        this._remainingAmmo += amount;
        if (this._remainingAmmo > this._maxAmmo) {
            this._remainingAmmo = this._maxAmmo;
        }
        return this;
    }

    update(time: number, delta: number): void {
        if (this._isFiring && this._canFire()) {
            this._fire();
            const heat = this._heatPerShot ?? 1;
            this.ship?.applyHeating(heat);
            this._lastFired = time;
        }
    }

    trigger(): void {
        window.clearTimeout(this._firingTimeout);
        this._isFiring = true;
        this._firingTimeout = window.setTimeout(() => this._isFiring = false, 100);
    }

    private _fire(): void {
        const shipLoc = this.ship.getLocation();
        const shipAngle = this.ship.getRotation();
        const shipVel = this.ship.getVelocity();
        let bulletOffset: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-20, 0).add(shipLoc);
        let shipRealLocation: Phaser.Math.Vector2 = this.ship.getLocation();
        let adjustedLocation: Phaser.Math.Vector2 = Phaser.Math.RotateAround(bulletOffset, shipRealLocation.x, shipRealLocation.y, Phaser.Math.DegToRad(shipAngle));
        new Bullet({
            scene: this.scene,
            weapon: this,
            location: adjustedLocation,
            force: this._force,
            damage: this._damagePerHit,
            angle: shipAngle,
            startingV: shipVel,
            scale: this._bulletScale,
            mass: this._bulletMass,
            spriteName: 'bullet'
        });
        this._remainingAmmo--;
    }

    private _canFire(): boolean {
        return this.active
            && this._remainingAmmo > 0
            && this.scene.time.now >= +this._lastFired + +this._firingDelay
            && !this.ship?.isOverheating();
    }
}