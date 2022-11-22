import { Constants } from "../../../utilities/constants";
import { Bullet } from "./bullet";
import { OffenceAttachment } from "./offence-attachment";
import { OffenceAttachmentOptions } from "./offence-attachment-options";

export class CannonAttachment extends OffenceAttachment {
    private _cannonSound: Phaser.Sound.BaseSound;
    
    constructor(options: OffenceAttachmentOptions) {
        super(options);

        this.maxAmmo = 500;
        this.remainingAmmo = options.remainingAmmo || this.maxAmmo;
        this.firingDelay = 1000;
        this.heatPerShot = 1;

        const sprite = this.scene.add.sprite(0, 0, 'cannon');
        this.gameObj = this.scene.add.container(0, 0, [sprite]);
        this.gameObj.setSize(sprite.width, sprite.height);
        this.gameObj.setDepth(Constants.DEPTH_PLAYER);
        this.scene.physics.add.existing(this.gameObj);

        this._cannonSound = this.scene.sound.add('cannon-fire');
    }
    
    protected _fire(): void {
        this._cannonSound.play();
        let bulletOffset: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-20, 0).add(this.getLocation());
        let shipRealLocation: Phaser.Math.Vector2 = this.ship.getLocation();
        let adjustedLocation: Phaser.Math.Vector2 = Phaser.Math.RotateAround(bulletOffset, shipRealLocation.x, shipRealLocation.y, Phaser.Math.DegToRad(this.getRotation()));
        new Bullet({
            scene: this.scene,
            location: adjustedLocation,
            attachment: this,
            force: 600,
            damage: 40,
            scale: 2, 
            mass: 1,
            angle: this.getRotation(),
            startingV: this.getVelocity(),
            spriteName: 'bullet'
        });
        this.remainingAmmo--;
    }
}