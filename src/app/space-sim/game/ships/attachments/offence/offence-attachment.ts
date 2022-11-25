import { CanShoot } from "../../../interfaces/can-shoot";
import { ShipAttachment } from "../ship-attachment";
import { OffenceAttachmentOptions } from "./offence-attachment-options";

export abstract class OffenceAttachment extends ShipAttachment implements CanShoot {
    protected _maxAmmo: number;
    protected _firingDelay: number;
    protected _remainingAmmo: number;
    protected _heatPerShot: number;
    
    private _lastFired: number;
    private _isFiring: boolean;
    private _firingTimeout: number;

    constructor(options: OffenceAttachmentOptions) {
        super(options);
        this._lastFired = 0;
    }

    get ammo(): number {
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

    protected abstract _fire(): void;

    private _canFire(): boolean {
        return this.active
            && this._remainingAmmo > 0
            && this.scene.time.now >= +this._lastFired + +this._firingDelay
            && !this.ship?.isOverheating();
    }
}