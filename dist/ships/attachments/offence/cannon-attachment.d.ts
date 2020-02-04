import { ShipAttachment } from "../ship-attachment";
import { CanShoot } from "../../../interfaces/can-shoot";
export declare class CannonAttachment extends ShipAttachment implements CanShoot {
    private maxAmmo;
    private remainingAmmo;
    private cooldownTime;
    private firingDelay;
    constructor(scene: Phaser.Scene);
    reload(amount: number): void;
    getRemainingAmmo(): number;
    update(): void;
    trigger(): void;
    fire(direction?: Phaser.Math.Vector2): void;
}
