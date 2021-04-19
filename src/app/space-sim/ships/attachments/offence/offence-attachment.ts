import { CanShoot } from "../../../interfaces/can-shoot";
import { ShipAttachment } from "../ship-attachment";

export abstract class OffenceAttachment extends ShipAttachment implements CanShoot {
    protected maxAmmo: number;
    protected remainingAmmo: number;
    protected lastFired: number;
    protected firingDelay: number;
    
    reload(amount: number): void {
        this.remainingAmmo += amount;
        if (this.remainingAmmo > this.maxAmmo) {
            this.remainingAmmo = this.maxAmmo;
        }
    }

    getRemainingAmmo(): number {
        return this.remainingAmmo;
    }

    trigger(): void {
        if (this.active) {
            this.fire();
        }
    }

    abstract fire(direction?: Phaser.Math.Vector2): void;
    abstract update(time: number, delta: number): void;
}