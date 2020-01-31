import { ShipAttachment } from "../ship-attachment";
import { CanShoot } from "../../../interfaces/can-shoot";
export declare class CanonAttachment extends ShipAttachment implements CanShoot {
    private maxAmmo;
    private remainingAmmo;
    private cooldownTime;
    private lastFiredAt;
    constructor(scene: Phaser.Scene);
    reload(amount: number): void;
    getRemainingAmmo(): number;
    update(): void;
    fire(direction?: Phaser.Math.Vector2): void;
}
