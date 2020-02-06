import { CanThrust } from "../../../interfaces/can-thrust";
import { ShipPod } from "../../ship-pod";
import { Constants } from "../../../utilities/constants";

export class Thruster implements CanThrust {
    private ship: ShipPod;
    private scene: Phaser.Scene;
    private flareParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
    
    constructor(ship: ShipPod, scene: Phaser.Scene) {
        this.ship = ship;
        this.scene = scene;
        this.flareParticles = scene.add.particles('flares');
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
        throw new Error("Method not implemented.");
    }

    strafeRight(): void {
        throw new Error("Method not implemented.");
    }

    thrustBackwards(): void {
        throw new Error("Method not implemented.");
    }

    private applyThrust(force: number, fuel: number, heat: number): void {
        if (this.ship.getRemainingFuel() > 0) {
            let heading: Phaser.Math.Vector2 = this.ship.getHeading();
            let deltaV: Phaser.Math.Vector2 = heading.multiply(new Phaser.Math.Vector2(force, force));
            this.ship.getPhysicsBody().velocity.add(deltaV);
            
            this.ship.reduceFuel(fuel);
            this.ship.applyHeating(heat);
        }
    }

    private displayThrusterFire(colour: Constants.Flare, startScale: number, quantity: number): void {
        // make thruster fire
        let pos: Phaser.Math.Vector2 = this.ship.getRealLocation();
        let offset: Phaser.Math.Vector2 = new Phaser.Math.Vector2(20, 0).add(pos);
        let h: Phaser.Math.Vector2 = this.ship.getHeading().negate();
        let loc: Phaser.Geom.Point = Phaser.Math.RotateAround(offset, pos.x, pos.y, Phaser.Math.DegToRad(this.ship.getRotation()));
        let v: Phaser.Math.Vector2 = this.ship.getVelocity();
        this.flareParticles.createEmitter({
            frame: colour as number,
            x: loc.x,
            y: loc.y,
            lifespan: { min: 250, max: 500 },
            speedX: { min: h.x*100, max: h.x*500 },
            speedY: { min: h.y*100, max: h.y*500 },
            angle: 0,
            gravityX: 0,
            gravityY: 0,
            scale: { start: startScale, end: 0 },
            quantity: quantity,
            blendMode: 'ADD',
            maxParticles: 10
        });
    }
}