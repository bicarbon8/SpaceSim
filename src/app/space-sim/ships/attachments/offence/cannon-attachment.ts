import { Bullet } from "./bullet";
import { OffenceAttachment } from "./offence-attachment";

export class CannonAttachment extends OffenceAttachment {
    constructor(scene: Phaser.Scene) {
        super(scene);

        this.maxAmmo = 500;
        this.remainingAmmo = this.maxAmmo;
        this.lastFired = 0;
        this.firingDelay = 1000; // milliseconds

        this.gameObj = this.scene.add.sprite(0, 0, 'cannon');
        this.scene.physics.add.existing(this.gameObj);
    }

    update(): void {

    }
    
    fire(direction?: Phaser.Math.Vector2): void {
        if (this.active) {
            if (this.getRemainingAmmo() > 0) {
                if (this.scene.game.getTime() > this.lastFired + this.firingDelay) {
                    let bulletOffset: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-20, 0).add(this.getLocation());
                    let shipRealLocation: Phaser.Math.Vector2 = this.ship.getLocation();
                    let adjustedLocation: Phaser.Math.Vector2 = Phaser.Math.RotateAround(bulletOffset, shipRealLocation.x, shipRealLocation.y, Phaser.Math.DegToRad(this.getRotation()));
                    new Bullet(this.scene, {
                        location: adjustedLocation,
                        force: 1000,
                        angle: this.getRotation(),
                        startingV: this.getVelocity(),
                        spriteName: 'bullet'
                    });
                    this.remainingAmmo--;
                    this.lastFired = this.scene.game.getTime();
                }
            }
        }
    }
}