import { Constants } from "../../../utilities/constants";
import { ShipAttachment } from "../ship-attachment";
import { ThrusterAttachmentOptions } from "./thruster-attachment-options";

type ThrustOptions = {
    force: number;
    fuel: number;
    heat: number;
    heading: Phaser.Math.Vector2;
};

export class ThrusterAttachment extends ShipAttachment {
    private _flareParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private _isThrusterActive: boolean;
    private _thrusterTimeout: number;
    private _thrusterSound: Phaser.Sound.BaseSound;
    private _elapsedSinceApplied: number;
    
    constructor(options: ThrusterAttachmentOptions) {
        super(options);
        this._elapsedSinceApplied = Constants.Ship.Attachments.Utility.Thruster.USAGE_DELAY_MS;
        this._createGameObject();
    }

    update(time: number, delta: number): void {
        this._elapsedSinceApplied += delta;
        if (this._canThrust()) {
            if (this._isThrusterActive) {
                this._applyThrust({
                    force: Constants.Ship.Attachments.Utility.Thruster.FORCE,
                    fuel: Constants.Ship.Attachments.Utility.Thruster.FUEL_PER_USE,
                    heat: Constants.Ship.Attachments.Utility.Thruster.HEAT_PER_USE,
                    heading: this.ship?.getHeading()
                });
                this._elapsedSinceApplied = 0;
            }
        }
    }

    trigger(): void {
        window.clearTimeout(this._thrusterTimeout);
        this._isThrusterActive = true;
        this._thrusterTimeout = window.setTimeout(() => this._isThrusterActive = false, 100);
    }

    private _applyThrust(opts: ThrustOptions): void {
        // sound effects
        if (!this._thrusterSound.isPlaying) {
            this._thrusterSound.play({seek:0.3, volume: 0.2});
            setTimeout(() => {
                this._thrusterSound.stop();
            }, 250);
        }
        // visual effects
        this._displayThrusterFire();

        let deltaV: Phaser.Math.Vector2 = opts.heading.multiply(new Phaser.Math.Vector2(opts.force, opts.force));
        let newV: Phaser.Math.Vector2 = this.ship.getVelocity().add(deltaV);
        this.ship?.getPhysicsBody()?.setVelocity(newV.x, newV.y);
        
        this.ship?.reduceFuel(opts.fuel);
        this.ship?.applyHeating(opts.heat);
    }

    private _displayThrusterFire(): void {
        // make thruster fire
        this._flareParticles.createEmitter({
            frame: Constants.UI.SpriteMaps.Flares.yellow,
            lifespan: {min: 50, max: 100},
            speedX: -500,
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

    private _canThrust(): boolean {
        return this.active
            && this.ship?.getRemainingFuel() > 0 
            && this._elapsedSinceApplied >= Constants.Ship.Attachments.Utility.Thruster.USAGE_DELAY_MS
            && !this.ship.isOverheating();
    }

    private _createGameObject(): void {
        this._thrusterSound = this.scene.sound.add('thruster-fire');
        this._flareParticles = this.scene.add.particles('flares');
        this._flareParticles.setPosition(-20, 0);
        this.gameObj = this.scene.add.container(0, 0, [this._flareParticles]);
        this.gameObj.setSize(32, 32);
        this.gameObj.setDepth(Constants.UI.Layers.PLAYER);
        this.gameObj.sendToBack(this._flareParticles);
    }
}