import { CanShoot } from "../../../interfaces/can-shoot";
import { ShipAttachment } from "../ship-attachment";
import { OffenceAttachmentOptions } from "./offence-attachment-options";

export abstract class OffenceAttachment extends ShipAttachment implements CanShoot {
    protected maxAmmo: number;
    protected firingDelay: number;
    protected remainingAmmo: number;
    protected heatPerSecond: number;
    
    private _lastFired: number;

    constructor(options: OffenceAttachmentOptions) {
        super(options);
        this._lastFired = 0;
    }

    get ammo(): number {
        return this.remainingAmmo;
    }

    trigger(): void {
        if (this.active) {
            if (this.remainingAmmo > 0) {
                if (this.scene.time.now >= +this._lastFired + +this.firingDelay) {
                    this._fire();
                    this.ship.applyHeating(+this.heatPerSecond * (+this.firingDelay / 1000));
                    this._lastFired = this.scene.time.now;
                }
            }
        }
    }

    protected abstract _fire(): void;

    abstract update(time: number, delta: number): void;
}