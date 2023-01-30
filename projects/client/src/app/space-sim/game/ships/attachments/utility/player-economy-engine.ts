import { Ship, EconomyEngine, TryCatch } from "space-sim-shared";
import { environment } from "../../../../../../environments/environment";
import { SpaceSimClient } from "../../../space-sim-client";

export class PlayerEconomyEngine extends EconomyEngine {
    private _thrusterSound: Phaser.Sound.BaseSound;
    private _flareParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;

    static preload(scene: Phaser.Scene): void {
        scene.load.audio('thruster-fire', `${environment.baseUrl}/assets/audio/effects/thrusters.wav`);
    }

    override setShip(s: Ship): this {
        super.setShip(s);
        if (!this._flareParticles) {
            this._addUiComponents();
        }
        return this;
    }

    override update(time: number, delta: number): void {
        super.update(time, delta);
        if (this.enabled) {
            // sound effects
            if (!this._thrusterSound?.isPlaying) {
                this._thrusterSound?.play({seek:0.3, volume: 0.2});
            }
            // visual effects
            this._displayThrusterFire();
        } else {
            if (this._thrusterSound?.isPlaying) {
                this._thrusterSound?.stop();
            }
        }
    }

    private _displayThrusterFire(): void {
        // make thruster fire
        this._flareParticles.createEmitter({
            frame: SpaceSimClient.Constants.UI.SpriteMaps.Flares.red,
            lifespan: {min: 50, max: 100},
            speedX: 500,
            speedY: 0,
            gravityX: 0,
            gravityY: 0,
            scale: { start: 0.2, end: 0 },
            blendMode: 'ADD',
            maxParticles: 3,
            quantity: 3,
            radial: false
        });
    }
    
    private _addUiComponents(): void {
        TryCatch.run(() => {
            this._thrusterSound = this.scene.sound.add('thruster-fire');
        }, 'none');
        this._flareParticles = this.scene.add.particles('flares');
        this._flareParticles.setPosition(20, 0); // behind ship
        this.ship.rotationContainer.add(this._flareParticles);
        this.ship.rotationContainer.sendToBack(this._flareParticles);
    }
}