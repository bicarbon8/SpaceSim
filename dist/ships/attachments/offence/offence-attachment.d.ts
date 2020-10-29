import { CanShoot } from "../../../interfaces/can-shoot";
import { ShipAttachment } from "../ship-attachment";
export declare abstract class OffenceAttachment extends ShipAttachment implements CanShoot {
    protected maxAmmo: number;
    protected remainingAmmo: number;
    protected lastFired: number;
    protected firingDelay: number;
    reload(amount: number): void;
    getRemainingAmmo(): number;
    trigger(): void;
    abstract fire(direction?: Phaser.Math.Vector2): void;
    abstract update(): void;
}
