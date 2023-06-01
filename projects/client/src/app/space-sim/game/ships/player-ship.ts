import { LayoutContainer } from "phaser-ui-components";
import { BaseScene, DamageMetadata, Ship, ShipOptions, SpaceSim } from "space-sim-shared";
import { environment } from "../../../../environments/environment";
import { SpaceSimClient } from "../space-sim-client";
import { Animations } from "../ui-components/animations";

export class PlayerShip extends Ship {
    private _shipIntegrityIndicator: LayoutContainer;
    private _shipHeatIndicator: Phaser.GameObjects.Sprite;
    private _shipOverheatIndicator: Phaser.GameObjects.Text;
    private _shipDamageFlicker: Phaser.Tweens.Tween;
    private _radarSprite: Phaser.GameObjects.Sprite;
    private _selfDestructText: Phaser.GameObjects.Text;

    static preload(scene: Phaser.Scene): void {
        scene.load.image('weapons-1', `${environment.baseUrl}/assets/sprites/ship-parts/weapons-1.png`);
        scene.load.image('weapons-2', `${environment.baseUrl}/assets/sprites/ship-parts/weapons-2.png`);
        scene.load.image('weapons-3', `${environment.baseUrl}/assets/sprites/ship-parts/weapons-3.png`);
        scene.load.image('wings-1', `${environment.baseUrl}/assets/sprites/ship-parts/wings-1.png`);
        scene.load.image('wings-2', `${environment.baseUrl}/assets/sprites/ship-parts/wings-2.png`);
        scene.load.image('wings-3', `${environment.baseUrl}/assets/sprites/ship-parts/wings-3.png`);
        scene.load.image('cockpit-1', `${environment.baseUrl}/assets/sprites/ship-parts/cockpit-1.png`);
        scene.load.image('cockpit-2', `${environment.baseUrl}/assets/sprites/ship-parts/cockpit-2.png`);
        scene.load.image('cockpit-3', `${environment.baseUrl}/assets/sprites/ship-parts/cockpit-3.png`);
        scene.load.image('engine-1', `${environment.baseUrl}/assets/sprites/ship-parts/engine-1.png`);
        scene.load.image('engine-2', `${environment.baseUrl}/assets/sprites/ship-parts/engine-2.png`);
        scene.load.image('engine-3', `${environment.baseUrl}/assets/sprites/ship-parts/engine-3.png`);
        scene.load.image('minimap-player', `${environment.baseUrl}/assets/sprites/minimap-player.png`);
        scene.load.image('overheat-glow', `${environment.baseUrl}/assets/particles/red-glow.png`);
    }

    constructor(scene: BaseScene, options: ShipOptions) {
        super(scene, options);

        this._addVisualsToGameObject(options);
    }

    get radarSprite(): Phaser.GameObjects.Sprite {
        return this._radarSprite;
    }

    override update(time: number, delta: number): void {
        super.update(time, delta);

        if (this.active) {
            this._updateOverheatingSpriteAndText();
            this._updateSelfDestructText();
        }
    }

    override subtractIntegrity(amount: number, damageOpts: DamageMetadata): void {
        super.subtractIntegrity(amount, damageOpts);

        if (this.active && amount !== 0) {
            // keep the health bar visible by killing any active fade out tweens
            this.scene.tweens.killTweensOf(this._shipIntegrityIndicator);
            this._updateIntegrityIndicator();
            
            if (!this._shipDamageFlicker?.isPlaying()) {
                this._shipDamageFlicker = Animations.flicker(this.rotationContainer, 200, () => {
                    this.rotationContainer?.setAlpha(1);
                });
            }
        }
    }

    override addIntegrity(amount: number): void {
        super.addIntegrity(amount);

        if (this.active && amount !== 0) {
            // keep the health bar visible by killing any active fade out tweens
            this.scene.tweens.killTweensOf(this._shipIntegrityIndicator);
            this._updateIntegrityIndicator();
        }
    }

    private _addVisualsToGameObject(options: ShipOptions): void {
        this.setDepth(SpaceSimClient.Constants.UI.Layers.PLAYER);

        // create ship sprite and set container bounds based on sprite size
        const weaponsSprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: `weapons-${this.weaponsKey}`,
            origin: 0.5
        }, false);
        const wingsSprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: `wings-${this.wingsKey}`,
            origin: 0.5
        }, false);
        const cockpitSprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: `cockpit-${this.cockpitKey}`,
            origin: 0.5
        }, false);
        const engineSprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: `engine-${this.engineKey}`,
            origin: 0.5
        }, false);
        this.rotationContainer.add([weaponsSprite, wingsSprite, cockpitSprite, engineSprite]);

        this._createIntegrityIndicator();
        this._createHeatIndicator();
        this._createOverheatIndicator();
        this._createNameIndicator();
        this._createRadarSprite();
        this._createSelfDestructText();
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
        this.add(txt);
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
        this.add(this._shipIntegrityIndicator);
    }

    private _createHeatIndicator(): void {
        this._shipHeatIndicator = this.scene.add.sprite(0, 0, 'overheat-glow');
        this._shipHeatIndicator.setAlpha(0); // no heat
        this.add(this._shipHeatIndicator);
        this.sendToBack(this._shipHeatIndicator);
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
        this.add(this._shipOverheatIndicator);
    }

    private _createRadarSprite(): void {
        this._radarSprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: 'minimap-player'
        }, true);
        this.add(this._radarSprite)
            .bringToTop(this._radarSprite);
    }

    private _createSelfDestructText(): void {
        this._selfDestructText = this.scene.make.text({
            x: 0, 
            y: -75, 
            text: `3`,
            style: {font: '30px Courier', color: '#ffff00', stroke: '#ff0000', strokeThickness: 4}
        }).setAlpha(0);
        this._selfDestructText.setX(-this._selfDestructText.width / 2);
        this.add(this._selfDestructText);
    }

    /**
     * gradually increases visibility of heat sprite around ship as temperature
     * increases and displays overhead warning if ship temperature over max safe
     * value
     */
    private _updateOverheatingSpriteAndText(): void {
        if (this.active) {
            const alpha = this.temperature / SpaceSim.Constants.Ships.MAX_SAFE_TEMPERATURE;
            this._shipHeatIndicator.setAlpha(Math.min(alpha, 1));
            
            if (this.isOverheating) {
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

    private _updateIntegrityIndicator(): void {
        if (this.active && this._shipIntegrityIndicator) {
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

    private _updateSelfDestructText(): void {
        if (this.active) {
            if (this.destroyAtTime) {
                const remainingTime = this.destroyAtTime - this.scene.game.getTime();
                const remainingSeconds = Math.ceil(remainingTime / 1000);

                this._selfDestructText.setText(`${remainingSeconds}`)
                    .setAlpha(1);
            } else {
                this._selfDestructText.setAlpha(0);
            }
        }
    }
}