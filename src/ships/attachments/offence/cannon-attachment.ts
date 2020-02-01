import { ShipAttachment } from "../ship-attachment";
import { CanShoot } from "../../../interfaces/can-shoot";
import { Globals } from "../../../utilities/globals";
import { Helpers } from "../../../utilities/helpers";
import { Bullet } from "./bullet";

export class CannonAttachment extends ShipAttachment implements CanShoot {
    private maxAmmo: number;
    private remainingAmmo: number;
    private cooldownTime: number;
    private lastFiredAt: number;

    constructor(scene: Phaser.Scene) {
        super(scene);

        this.maxAmmo = 500;
        this.remainingAmmo = this.maxAmmo;
        this.cooldownTime = 1000; // milliseconds
        this.lastFiredAt = 0; // never

        this.gameObj = this.scene.physics.add.sprite(0, 0, 'cannon');
    }

    reload(amount: number): void {
        this.remainingAmmo += amount;
        if (this.remainingAmmo > this.maxAmmo) {
            this.remainingAmmo = this.maxAmmo;
        }
    }

    getRemainingAmmo(): number {
        return this.remainingAmmo;
    }

    update(): void {
        
    }

    trigger(): void {
        if (!Globals.paused && this.active) {
            this.fire();
        }
    }

    fire(direction?: Phaser.Math.Vector2): void {
        if (!Globals.paused && this.active) {
            if (this.getRemainingAmmo() > 0) {
                if (Helpers.now() - this.lastFiredAt > this.cooldownTime) {
                    let loc: Phaser.Math.Vector2 = this.getRealLocation();
                    new Bullet(this.scene, {
                        x: loc.x,
                        y: loc.y,
                        force: 3000,
                        angle: this.getAngle()
                    });
                    this.lastFiredAt = Helpers.now();
                }
            }
        }
    }
}