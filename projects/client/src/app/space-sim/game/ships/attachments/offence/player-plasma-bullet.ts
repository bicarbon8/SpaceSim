import { BaseScene, Bullet, BulletOptions, Ship, TryCatch } from "space-sim-shared";
import { environment } from "../../../../../../environments/environment";
import { SpaceSimClient } from "../../../space-sim-client";
import { UiExploder } from "../../../ui-components/ui-exploder";

export class PlayerPlasmaBullet extends Bullet {
    private _fireSound: Phaser.Sound.BaseSound;
    private _hitSound: Phaser.Sound.BaseSound;
    private _exploder: UiExploder;
    
    static preload(scene: Phaser.Scene): void {
        scene.load.audio('cannon-fire', `${environment.baseUrl}/assets/audio/effects/cannon-fire.ogg`);
        scene.load.audio('bullet-hit', `${environment.baseUrl}/assets/audio/effects/bullet-hit.ogg`);
    }

    constructor(scene: BaseScene, options: BulletOptions) {
        super(scene, options);

        this._exploder = new UiExploder(this.scene);
        this._addUiElements();

        this._fireSound?.play();
    }

    override onShipCollision(ship: Ship): void {
        super.onShipCollision(ship);
        this._hitSound?.play();
        this._exploder.explode({
            location: this.location,
            scale: 0.01
        });
    }

    private _addUiElements(): void {
        const glow = this.scene.add.sprite(0, 0, 'flares', SpaceSimClient.Constants.UI.SpriteMaps.Flares.red);
        const glowScale = (this.radius * 2) / glow.width;
        glow.setScale(glowScale);
        this.scene.add.tween({
            targets: glow,
            scale: 0,
            angle: 1000,
            yoyo: false,
            duration: this.timeout
        });
        this.setDepth(SpaceSimClient.Constants.UI.Layers.PLAYER)
            .add(glow);
        TryCatch.run(() => this._fireSound = this.scene.sound.add('cannon-fire'), 'warn');
        TryCatch.run(() => this._hitSound = this.scene.sound.add('bullet-hit'), 'warn');
    }
}