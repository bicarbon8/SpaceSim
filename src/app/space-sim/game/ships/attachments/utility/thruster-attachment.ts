import { HasThruster } from "../../../interfaces/has-thruster";
import { Constants } from "../../../utilities/constants";
import { ShipAttachment } from "../ship-attachment";
import { Helpers } from "../../../utilities/helpers";
import { ThrusterAttachmentOptions } from "./thruster-attachment-options";

export class ThrusterAttachment extends ShipAttachment implements HasThruster {
    private readonly _flareParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private _lastThrusted: number;
    private _thrusterSound: Phaser.Sound.BaseSound;
    private _boosterSound: Phaser.Sound.BaseSound;
    
    constructor(options: ThrusterAttachmentOptions) {
        super(options);
        this._flareParticles = this.scene.add.particles('flares');
        this._flareParticles.setDepth(Constants.DEPTH_PLAYER);
        this.gameObj = this.scene.add.sprite(0, 0, 'thruster');
        this.gameObj.setDepth(Constants.DEPTH_PLAYER);
        this._lastThrusted = 0;
        this._thrusterSound = this.scene.sound.add('thruster-fire');
        this._boosterSound = this.scene.sound.add('booster-fire');
    }

    update(time: number, delta: number): void {
        
    }

    trigger(): void {
        if(this.active) {
            this.thrustFowards();
        }
    }
    
    thrustFowards(): void {
        this._applyThrust(Constants.THRUSTER_FORCE, Constants.FUEL_PER_THRUST, Constants.HEAT_PER_THRUST, this.ship.getHeading());
        this._displayThrusterFire(Constants.Flare.yellow, 0.2);
    }
    
    boostForwards(): void {
        this._applyThrust(Constants.BOOSTER_FORCE, Constants.FUEL_PER_BOOST, Constants.HEAT_PER_BOOST, this.ship.getHeading());
        this._displayThrusterFire(Constants.Flare.blue, 0.5);
    }

    strafeLeft(): void {
        this._applyThrust(Constants.THRUSTER_FORCE * 0.25, Constants.FUEL_PER_THRUST, Constants.HEAT_PER_THRUST, this.ship.getHeading().rotate(Helpers.deg2rad(-90)));
    }

    strafeRight(): void {
        this._applyThrust(Constants.THRUSTER_FORCE * 0.25, Constants.FUEL_PER_THRUST, Constants.HEAT_PER_THRUST, this.ship.getHeading().rotate(Helpers.deg2rad(90)));
    }

    thrustBackwards(): void {
        this._applyThrust(Constants.THRUSTER_FORCE * 0.10, Constants.FUEL_PER_THRUST, Constants.HEAT_PER_THRUST, this.ship.getHeading().negate());
    }

    private _applyThrust(force: number, fuel: number, heat: number, heading: Phaser.Math.Vector2): void {
        if (this.ship?.getRemainingFuel() > 0 && this.scene.game.getTime() > this._lastThrusted + Constants.THRUSTER_DELAY) {
            if (force === Constants.THRUSTER_FORCE) {
                if (!this._thrusterSound.isPlaying) {
                    this._thrusterSound.play({seek:0.3, volume: 0.2});
                    setTimeout(() => {
                        this._thrusterSound.stop();
                    }, 250);
                }
            }
            if (force === Constants.BOOSTER_FORCE) {
                this._boosterSound.play({volume: 0.2});
            }
            let deltaV: Phaser.Math.Vector2 = heading.multiply(new Phaser.Math.Vector2(force, force));
            let newV: Phaser.Math.Vector2 = this.ship.getVelocity().add(deltaV);
            this.ship?.getPhysicsBody()?.setVelocity(newV.x, newV.y);
            
            this.ship?.reduceFuel(fuel);
            this.ship?.applyHeating(heat);
            this._lastThrusted = this.scene.game.getTime();
        }
    }

    private _displayThrusterFire(colour: Constants.Flare, startScale: number): void {
        if (this.ship.getRemainingFuel() > 0) {
            // make thruster fire
            let shipPosition: Phaser.Math.Vector2 = this.ship.getLocation();
            let emissionPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(20, 0).add(shipPosition);
            let adjustedEmissionPosition: Phaser.Math.Vector2 = Phaser.Math.RotateAround(emissionPosition, shipPosition.x, shipPosition.y, Phaser.Math.DegToRad(this.ship.getRotation()));
            this._flareParticles.createEmitter({
                frame: colour as number,
                x: adjustedEmissionPosition.x,
                y: adjustedEmissionPosition.y,
                lifespan: {min: 50, max: 100},
                gravityX: 0,
                gravityY: 0,
                scale: { start: startScale, end: 0 },
                blendMode: 'ADD',
                maxParticles: 3,
                quantity: 1,
                radial: false
            });
        }
    }
}