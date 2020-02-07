import { ShipAttachment } from "../ship-attachment";
import { CanShoot } from "../../../interfaces/can-shoot";
import { Bullet } from "./bullet";

export class CannonAttachment extends ShipAttachment implements CanShoot {
    private maxAmmo: number;
    private remainingAmmo: number;
    private lastFired: number;
    private firingDelay: number;

    constructor(scene: Phaser.Scene) {
        super(scene);

        this.maxAmmo = 500;
        this.remainingAmmo = this.maxAmmo;
        this.lastFired = 0;
        this.firingDelay = 1000; // milliseconds

        this.gameObj = this.scene.add.sprite(0, 0, 'cannon');
        this.scene.physics.add.existing(this.gameObj);
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
        if (this.active) {
            this.fire();
        }
    }

    fire(direction?: Phaser.Math.Vector2): void {
        if (this.active) {
            if (this.getRemainingAmmo() > 0) {
                if (this.scene.game.getTime() > this.lastFired + this.firingDelay) {
                    let loc: Phaser.Math.Vector2 = this.getRealLocation();
                    new Bullet(this.scene, {
                        x: loc.x,
                        y: loc.y,
                        force: 3000,
                        angle: this.getRotation(),
                        startingV: this.getVelocity()
                    });
                    this.lastFired = this.scene.game.getTime();
                }
            }
        }
    }
}