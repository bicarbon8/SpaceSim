import { HasThruster } from "../../../interfaces/has-thruster";
import { Constants } from "../../../utilities/constants";
import { ShipAttachment } from "../ship-attachment";
import { Helpers } from "../../../utilities/helpers";
import { ThrusterAttachmentOptions } from "./thruster-attachment-options";

export class ThrusterAttachment extends ShipAttachment implements HasThruster {
    private flareParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private _lastThrusted: number;
    
    constructor(options: ThrusterAttachmentOptions) {
        super(options);
        this.flareParticles = this.scene.add.particles('flares');
        this.flareParticles.setDepth(Constants.DEPTH_PLAYER);
        this.gameObj = this.scene.add.sprite(0, 0, 'thruster');
        this.gameObj.setDepth(Constants.DEPTH_PLAYER);
        this._lastThrusted = 0;
    }

    update(time: number, delta: number): void {
        
    }

    trigger(): void {
        if(this.active) {
            this.thrustFowards();
        }
    }
    
    thrustFowards(): void {
        this.applyThrust(Constants.THRUSTER_FORCE, Constants.FUEL_PER_THRUST, Constants.HEAT_PER_THRUST, this.ship.getHeading());
        this.displayThrusterFire(Constants.Flare.yellow, 0.2);
    }
    
    boostForwards(): void {
        this.applyThrust(Constants.BOOSTER_FORCE, Constants.FUEL_PER_BOOST, Constants.HEAT_PER_BOOST, this.ship.getHeading());
        this.displayThrusterFire(Constants.Flare.blue, 1);
    }

    strafeLeft(): void {
        this.applyThrust(Constants.THRUSTER_FORCE * 0.25, Constants.FUEL_PER_THRUST, Constants.HEAT_PER_THRUST, this.ship.getHeading().rotate(Helpers.deg2rad(-90)));
    }

    strafeRight(): void {
        this.applyThrust(Constants.THRUSTER_FORCE * 0.25, Constants.FUEL_PER_THRUST, Constants.HEAT_PER_THRUST, this.ship.getHeading().rotate(Helpers.deg2rad(90)));
    }

    thrustBackwards(): void {
        this.applyThrust(Constants.THRUSTER_FORCE * 0.10, Constants.FUEL_PER_THRUST, Constants.HEAT_PER_THRUST, this.ship.getHeading().negate());
    }

    private applyThrust(force: number, fuel: number, heat: number, heading: Phaser.Math.Vector2): void {
        if (this.ship?.getRemainingFuel() > 0 && this.scene.game.getTime() > this._lastThrusted + Constants.THRUSTER_DELAY) {
            // let heading: Phaser.Math.Vector2 = this.ship.getHeading();
            let deltaV: Phaser.Math.Vector2 = heading.multiply(new Phaser.Math.Vector2(force, force));
            let newV: Phaser.Math.Vector2 = this.ship.getVelocity().add(deltaV);
            this.ship?.getPhysicsBody()?.setVelocity(newV.x, newV.y);
            
            this.ship?.reduceFuel(fuel);
            this.ship?.applyHeating(heat);
            this._lastThrusted = this.scene.game.getTime();
        }
    }

    private displayThrusterFire(colour: Constants.Flare, startScale: number): void {
        if (this.ship.getRemainingFuel() > 0) {
            // make thruster fire
            let shipPosition: Phaser.Math.Vector2 = this.ship.getLocation();
            let emissionPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(20, 0).add(shipPosition);
            let adjustedEmissionPosition: Phaser.Math.Vector2 = Phaser.Math.RotateAround(emissionPosition, shipPosition.x, shipPosition.y, Phaser.Math.DegToRad(this.ship.getRotation()));
            this.flareParticles.createEmitter({
                frame: colour as number,
                x: adjustedEmissionPosition.x,
                y: adjustedEmissionPosition.y,
                lifespan: 250,
                gravityX: 0,
                gravityY: 0,
                scale: { start: startScale, end: 0 },
                blendMode: 'ADD',
                maxParticles: 1,
                quantity: 1,
                radial: false
            });
        }
    }
}