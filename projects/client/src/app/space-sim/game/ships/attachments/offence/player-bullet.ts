import { BaseScene, Bullet, BulletOptions, Helpers, Ship, SpaceSim } from "space-sim-shared";
import { environment } from "../../../../../../environments/environment";
import { UiExploder } from "../../../ui-components/ui-exploder";

export class PlayerBullet extends Bullet {
    private _fireSound: Phaser.Sound.BaseSound;
    private _hitSound: Phaser.Sound.BaseSound;
    private _exploder: UiExploder;
    
    static preload(scene: Phaser.Scene): void {
        scene.load.image('bullet', `${environment.baseUrl}/assets/sprites/bullet.png`);
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
            scale: 0.25
        });
    }

    private _addUiElements(): void {
        const ball = this.scene.add.sprite(0, 0, 'bullet');
        const ballScale = (this.radius * 2) / ball.width;
        ball.setScale(ballScale);
        const glow = this.scene.add.sprite(0, 0, 'flares', SpaceSim.Constants.UI.SpriteMaps.Flares.green);
        const glowScale = (this.radius * 2) / glow.width;
        glow.setScale(glowScale);
        const maxScale = glowScale + 0.1;
        this.scene.add.tween({
            targets: glow,
            scale: maxScale,
            angle: 359,
            yoyo: true,
            duration: 250
        });
        this.setDepth(SpaceSim.Constants.UI.Layers.PLAYER)
            .add([ball, glow]);
        Helpers.trycatch(() => this._fireSound = this.scene.sound.add('cannon-fire'), 'warn');
        Helpers.trycatch(() => this._hitSound = this.scene.sound.add('bullet-hit'), 'warn');
    }
}