import { Constants } from "../../../utilities/constants";
import { ShipAttachment } from "../ship-attachment";
import { ThrusterAttachmentOptions } from "./thruster-attachment-options";

type ThrustType = 'boost' | 'thrust';

type ThrustOptions = {
    type: ThrustType;
    force: number;
    fuel: number;
    heat: number;
    heading: Phaser.Math.Vector2;
};

export class ThrusterAttachment extends ShipAttachment {
    private _flareParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private _isThrusterActive: boolean;
    private _thrusterTimeout: number;
    private _isBoosterActive: boolean;
    private _boosterTimeout: number;
    private _thrusterSound: Phaser.Sound.BaseSound;
    private _boosterSound: Phaser.Sound.BaseSound;
    
    constructor(options: ThrusterAttachmentOptions) {
        super(options);
        this._createGameObject();
        this._thrusterSound = this.scene.sound.add('thruster-fire');
        this._boosterSound = this.scene.sound.add('booster-fire');
    }

    update(time: number, delta: number): void {
        if (this._canThrust()) {
            if (this._isBoosterActive) {
                this._applyThrust({
                    type: 'thrust',
                    force: Constants.BOOST_FORCE_PER_SECOND * (delta / 1000), 
                    fuel: Constants.BOOST_FUEL_PER_SECOND * (delta / 1000), 
                    heat: Constants.BOOST_HEAT_PER_SECOND * (delta / 1000), 
                    heading: this.ship?.getHeading()
                });
                this._displayThrusterFire(Constants.Flare.blue, 0.3);
            } else {
                if (this._isThrusterActive) {
                    this._applyThrust({
                        type: 'boost',
                        force: Constants.THRUSTER_FORCE_PER_SECOND * (delta / 1000), 
                        fuel: Constants.THRUSTER_FUEL_PER_SECOND * (delta / 1000), 
                        heat: Constants.THRUSTER_HEAT_PER_SECOND * (delta / 1000), 
                        heading: this.ship?.getHeading()
                    });
                    this._displayThrusterFire(Constants.Flare.yellow, 0.2);
                }
            }
        }
    }

    trigger(): void {
        this._thrustFowards();
    }
    
    private _thrustFowards(): void {
        window.clearTimeout(this._thrusterTimeout);
        this._isThrusterActive = true;
        this._thrusterTimeout = window.setTimeout(() => this._isThrusterActive = false, 100);
    }

    private _applyThrust(opts: ThrustOptions): void {
        if (opts.type === 'thrust') {
            if (!this._thrusterSound.isPlaying) {
                this._thrusterSound.play({seek:0.3, volume: 0.2});
                setTimeout(() => {
                    this._thrusterSound.stop();
                }, 250);
            }
        }
        if (opts.type === 'boost') {
            this._boosterSound.play({volume: 0.2});
        }
        let deltaV: Phaser.Math.Vector2 = opts.heading.multiply(new Phaser.Math.Vector2(opts.force, opts.force));
        let newV: Phaser.Math.Vector2 = this.ship.getVelocity().add(deltaV);
        this.ship?.getPhysicsBody()?.setVelocity(newV.x, newV.y);
        
        this.ship?.reduceFuel(opts.fuel);
        this.ship?.applyHeating(opts.heat);
    }

    private _displayThrusterFire(colour: Constants.Flare, startScale: number): void {
        // make thruster fire
        this._flareParticles.createEmitter({
            frame: colour as number,
            lifespan: {min: 50, max: 100},
            speedX: -500,
            speedY: 0,
            gravityX: 0,
            gravityY: 0,
            scale: { start: startScale, end: 0 },
            blendMode: 'ADD',
            maxParticles: 3,
            quantity: 3,
            radial: false
        });
    }

    private _canThrust(): boolean {
        return this.active
            && this.ship?.getRemainingFuel() > 0 
            && !this.ship.isOverheating();
    }

    private _createGameObject(): void {
        const sprite = this.scene.add.sprite(0, 0, 'thruster');
        this._flareParticles = this.scene.add.particles('flares');
        this._flareParticles.setPosition(-20, 0);
        this._flareParticles.setDepth(Constants.DEPTH_PLAYER);
        this.gameObj = this.scene.add.container(0, 0, [sprite, this._flareParticles]);
        this.gameObj.setSize(sprite.width, sprite.height);
        this.gameObj.setDepth(Constants.DEPTH_PLAYER);
        this.gameObj.sendToBack(this._flareParticles);
    }
}