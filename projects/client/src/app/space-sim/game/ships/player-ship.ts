import { LayoutContainer } from "phaser-ui-components";
import { Constants, DamageOptions, Ship, ShipOptions } from "space-sim-shared";
import { Animations } from "../utilities/animations";

export class PlayerShip extends Ship {
    private _shipIntegrityIndicator: LayoutContainer;
    private _shipHeatIndicator: Phaser.GameObjects.Sprite;
    private _shipOverheatIndicator: Phaser.GameObjects.Text;
    private _shipDamageFlicker: Phaser.Tweens.Tween;
    private _radarSprite: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, options: ShipOptions) {
        super(scene, options);

        this._addVisualsToGameObject(options);
    }

    override update(time: number, delta: number): void {
        super.update(time, delta);

        this._updateOverheatingSpriteAndText();
    }

    override sustainDamage(damageOpts: DamageOptions): void {
        super.sustainDamage(damageOpts);

        // keep the health bar visible by killing any active fade out tweens
        this.scene.tweens.killTweensOf(this._shipIntegrityIndicator);

        this._updateIntegrityIndicator();
        
        if (!this._shipDamageFlicker?.isPlaying()) {
            this._shipDamageFlicker = Animations.flicker(this.rotationContainer, 200, () => {
                this.rotationContainer?.setAlpha(1);
            });
        }
    }

    override repair(amount: number): void {
        super.repair(amount);

        this._updateIntegrityIndicator();
    }

    /**
     * gradually increases visibility of heat sprite around ship as temperature
     * increases and displays overhead warning if ship temperature over max safe
     * value
     */
    private _updateOverheatingSpriteAndText(): void {
        if (this.active) {
            const alpha = this.temperature / Constants.Ship.MAX_SAFE_TEMPERATURE;
            this._shipHeatIndicator.setAlpha(Math.min(alpha, 1));
            
            if (this.isOverheating()) {
                if (!this.scene.tweens.getTweensOf(this._shipOverheatIndicator)?.length) {
                    this._shipOverheatIndicator.setAlpha(1);
                    this.scene.tweens.add({
                        targets: this._shipOverheatIndicator,
                        alpha: 0,
                        yoyo: true,
                        duration: 200,
                        loop: -1
                    });
                }
            } else {
                // ensure "OVERHEAT" warning is off
                this.scene.tweens.killTweensOf(this._shipOverheatIndicator);
                this._shipOverheatIndicator.setAlpha(0);
            }
        }
    }

    private _addVisualsToGameObject(options: ShipOptions): void {
        this.positionContainer.setDepth(Constants.UI.Layers.PLAYER);

        // create ship sprite and set container bounds based on sprite size
        const weaponsSprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: `weapons-${this.weaponsKey}`
        }, false);
        const wingsSprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: `wings-${this.wingsKey}`
        }, false);
        const cockpitSprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: `cockpit-${this.cockpitKey}`
        }, false);
        const engineSprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: `engine-${this.engineKey}`
        }, false);
        this.rotationContainer.add([weaponsSprite, wingsSprite, cockpitSprite, engineSprite]);

        this._createIntegrityIndicator();
        this._createHeatIndicator();
        this._createOverheatIndicator();
        this._createNameIndicator();
        this._createRadarSprite();
    }

    private _createNameIndicator(): void {
        const txt = this.scene.make.text({
            text: this.name,
            style: {
                font: '20px Courier', 
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1
            },
            x: 0,
            y: 30 // under the ship
        });
        txt.setX(-(txt.width / 2));
        this.positionContainer.add(txt);
    }

    private _createIntegrityIndicator(): void {
        this._shipIntegrityIndicator = new LayoutContainer(this.scene, {
            y: -30,
            padding: 1,
            width: 102,
            height: 6,
            alignment: {horizontal: 'left'},
            backgroundStyles: {fillStyle: {color: 0xffffff}}
        });
        this._shipIntegrityIndicator.setAlpha(0); // only visible when damage sustained
        this.positionContainer.add(this._shipIntegrityIndicator);
    }

    private _createHeatIndicator(): void {
        this._shipHeatIndicator = this.scene.add.sprite(0, 0, 'overheat-glow');
        this._shipHeatIndicator.setAlpha(0); // no heat
        this.positionContainer.add(this._shipHeatIndicator);
        this.positionContainer.sendToBack(this._shipHeatIndicator);
        this.scene.tweens.add({
            targets: this._shipHeatIndicator,
            scale: 1.05,
            angle: 45,
            yoyo: true,
            duration: 500,
            loop: -1
        });
    }

    private _createOverheatIndicator(): void {
        this._shipOverheatIndicator = this.scene.add.text(0, -75, 'OVERHEAT', {font: '30px Courier', color: '#ffff00', stroke: '#ff0000', strokeThickness: 4});
        this._shipOverheatIndicator.setAlpha(0);
        this._shipOverheatIndicator.setX(-this._shipOverheatIndicator.width / 2);
        this.positionContainer.add(this._shipOverheatIndicator);
    }

    private _createRadarSprite(): void {
        this._radarSprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: 'minimap-player'
        }, true);
        this.positionContainer.add(this._radarSprite)
            .bringToTop(this._radarSprite);
    }

    private _updateIntegrityIndicator(): void {
        if (this._shipIntegrityIndicator) {
            this._shipIntegrityIndicator.removeContent(true);

            let square: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: {color: 0xff6060}});
            square.fillRect(-Math.floor(this.integrity/2), -2, this.integrity, 4);
            let squareContainer: Phaser.GameObjects.Container = this.scene.add.container(0, 0, [square]);
            squareContainer.setSize(this.integrity, 4);
            this._shipIntegrityIndicator.setContent(squareContainer);

            this._shipIntegrityIndicator.setAlpha(1); // make visible
            this.scene.tweens.killTweensOf(this._shipIntegrityIndicator);
            this.scene.tweens.add({ // fade out after 5 seconds
                targets: [this._shipIntegrityIndicator],
                alpha: 0,
                yoyo: false,
                loop: 0,
                delay: 5000,
                duration: 1000
            });
        }
    }
}