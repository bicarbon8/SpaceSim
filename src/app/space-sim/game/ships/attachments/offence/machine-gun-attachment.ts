import { Constants } from "../../../utilities/constants";
import { Bullet } from "./bullet";
import { OffenceAttachment } from "./offence-attachment";
import { OffenceAttachmentOptions } from "./offence-attachment-options";

export class MachineGunAttachment extends OffenceAttachment {
    constructor(options: OffenceAttachmentOptions) {
        super(options);

        this._maxAmmo = 1500;
        this._remainingAmmo = this._maxAmmo;
        this._firingDelay = 200; // milliseconds
        this._heatPerShot = 1;

        const sprite = this.scene.add.sprite(0, 0, 'cannon');
        this.gameObj = this.scene.add.container(0, 0, [sprite]);
        this.gameObj.setSize(sprite.width, sprite.height);
        this.gameObj.setDepth(Constants.UI.Layers.PLAYER);
        this.scene.physics.add.existing(this.gameObj);
    }
    
    protected _fire(): void {
        let bulletOffset: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-20, 0).add(this.getLocation());
        let shipRealLocation: Phaser.Math.Vector2 = this.ship.getLocation();
        let adjustedLocation: Phaser.Math.Vector2 = Phaser.Math.RotateAround(bulletOffset, shipRealLocation.x, shipRealLocation.y, Phaser.Math.DegToRad(this.getRotation()));
        new Bullet({
            scene: this.scene,
            attachment: this,
            location: adjustedLocation,
            force: 1000,
            damage: 10,
            angle: this.getRotation(),
            startingV: this.getVelocity(),
            scale: 0.25,
            mass: 0.01,
            spriteName: 'bullet'
        });
        this._remainingAmmo--;
    }
}