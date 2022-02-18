import { Constants } from "../../../utilities/constants";
import { Bullet } from "./bullet";
import { OffenceAttachment } from "./offence-attachment";
import { OffenceAttachmentOptions } from "./offence-attachment-options";

export class CannonAttachment extends OffenceAttachment {
    constructor(options: OffenceAttachmentOptions) {
        super(options);

        this.maxAmmo = 500;
        this.remainingAmmo = options.remainingAmmo || this.maxAmmo;
        this.firingDelay = 1000;
        this.heatPerSecond = 1;

        this.gameObj = this.scene.add.sprite(0, 0, 'cannon');
        this.gameObj.setDepth(Constants.DEPTH_PLAYER);
        this.scene.physics.add.existing(this.gameObj);
    }

    update(time: number, delta: number): void {

    }
    
    protected fire(): void {
        let bulletOffset: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-20, 0).add(this.getLocation());
        let shipRealLocation: Phaser.Math.Vector2 = this.ship.getLocation();
        let adjustedLocation: Phaser.Math.Vector2 = Phaser.Math.RotateAround(bulletOffset, shipRealLocation.x, shipRealLocation.y, Phaser.Math.DegToRad(this.getRotation()));
        new Bullet({
            scene: this.scene,
            location: adjustedLocation,
            attachment: this,
            force: 1000,
            angle: this.getRotation(),
            startingV: this.getVelocity(),
            spriteName: 'bullet'
        });
        this.remainingAmmo--;
    }
}