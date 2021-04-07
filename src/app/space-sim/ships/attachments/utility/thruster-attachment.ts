import { CanThrust } from "../../../interfaces/can-thrust";
import { ShipPod } from "../../ship-pod";
import { Constants } from "../../../utilities/constants";
import { ShipAttachment } from "../ship-attachment";

export class ThrusterAttachment extends ShipAttachment implements CanThrust {
    ship: ShipPod;
    scene: Phaser.Scene;
    private flareParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
    
    constructor(scene: Phaser.Scene) {
        super(scene);
        this.scene = scene;
        this.flareParticles = scene.add.particles('flares');
        this.gameObj = this.scene.add.sprite(0, 0, 'thruster');
        this.scene.physics.add.existing(this.gameObj);
    }

    update(): void {
        
    }

    trigger(): void {
        if(this.active) {
            this.thrustFowards();
        }
    }
    
    thrustFowards(): void {
        this.applyThrust(Constants.THRUSTER_FORCE, Constants.FUEL_PER_THRUST, Constants.HEAT_PER_THRUST);
        this.displayThrusterFire(Constants.Flare.yellow, 0.2, 1);
    }
    
    private lastBoostTime: number = 0;
    boostForwards(): void {
        if (this.scene.game.getTime() >= this.lastBoostTime + Constants.BOOSTER_COOLDOWN_TIME) {
            this.applyThrust(Constants.BOOSTER_FORCE, Constants.FUEL_PER_BOOST, Constants.HEAT_PER_BOOST);
            this.displayThrusterFire(Constants.Flare.blue, 1, 10);
            this.lastBoostTime = this.scene.game.getTime();
        }
    }

    strafeLeft(): void {
        
    }

    strafeRight(): void {
        
    }

    thrustBackwards(): void {
        
    }

    private applyThrust(force: number, fuel: number, heat: number): void {
        if (this.ship.getRemainingFuel() > 0) {
            let heading: Phaser.Math.Vector2 = this.ship.getHeading();
            let deltaV: Phaser.Math.Vector2 = heading.multiply(new Phaser.Math.Vector2(force, force));
            let newV: Phaser.Math.Vector2 = this.ship.getVelocity().add(deltaV);
            this.ship.getPhysicsBody().setVelocity(newV.x, newV.y);
            
            this.ship.reduceFuel(fuel);
            this.ship.applyHeating(heat);
        }
    }

    private displayThrusterFire(colour: Constants.Flare, startScale: number, quantity: number): void {
        // make thruster fire
        let shipPosition: Phaser.Math.Vector2 = this.ship.getRealLocation();
        let emissionPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(20, 0).add(shipPosition);
        let negatedShipHeading: Phaser.Math.Vector2 = this.ship.getHeading().negate();
        let adjustedEmissionPosition: Phaser.Math.Vector2 = Phaser.Math.RotateAround(emissionPosition, shipPosition.x, shipPosition.y, Phaser.Math.DegToRad(this.ship.getRotation()));
        let shipVelocity: Phaser.Math.Vector2 = this.ship.getVelocity();
        this.flareParticles.createEmitter({
            frame: colour as number,
            x: adjustedEmissionPosition.x,
            y: adjustedEmissionPosition.y,
            lifespan: { min: 250, max: 500 },
            speedX: { min: (negatedShipHeading.x*100)+shipVelocity.x, max: (negatedShipHeading.x*500)+shipVelocity.x },
            speedY: { min: (negatedShipHeading.y*100)+shipVelocity.y, max: (negatedShipHeading.y*500)+shipVelocity.y },
            angle: 0,
            gravityX: 0,
            gravityY: 0,
            scale: { start: startScale, end: 0 },
            quantity: quantity,
            blendMode: 'ADD',
            maxParticles: 1
        });
    }
}