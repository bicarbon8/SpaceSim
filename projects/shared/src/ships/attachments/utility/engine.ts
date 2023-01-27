import { SpaceSim } from "../../../space-sim";
import { BaseScene } from "../../../scenes/base-scene";
import { ShipAttachment } from "../ship-attachment";

type ThrustOptions = {
    force: number;
    fuel: number;
    heat: number;
    heading: Phaser.Math.Vector2;
};

export class Engine extends ShipAttachment {
    private _lastUsedAt: number;
    
    constructor(scene: BaseScene) {
        super(scene);
        this._lastUsedAt = SpaceSim.Constants.Ships.Engines.USAGE_DELAY_MS;
    }

    override setEnabled(enabled: boolean): void {
        super.setEnabled(enabled);
        let event: any;
        if (enabled) {
            event = SpaceSim.Constants.Events.ENGINE_ENABLED;
        } else {
            event = SpaceSim.Constants.Events.ENGINE_DISABLED;
        }
        this.scene.events.emit(event, this.ship.id);
    }

    update(time: number, delta: number): void {
        if (this._canThrust(time)) {
            this._applyThrust({
                force: SpaceSim.Constants.Ships.Engines.FORCE,
                fuel: SpaceSim.Constants.Ships.Engines.FUEL_PER_USE,
                heat: SpaceSim.Constants.Ships.Engines.HEAT_PER_USE,
                heading: this.ship?.heading
            });
            this._lastUsedAt = time;
        }
    }

    private _applyThrust(opts: ThrustOptions): void {
        let deltaV: Phaser.Math.Vector2 = opts.heading.multiply(new Phaser.Math.Vector2(opts.force, opts.force));
        let newV: Phaser.Math.Vector2 = this.ship.body.velocity.clone().add(deltaV);
        this.ship?.body?.setVelocity(newV.x, newV.y);
        
        this.ship?.subtractFuel(opts.fuel);
        this.ship?.addHeat(opts.heat);
    }

    private _canThrust(time: number): boolean {
        return this.enabled
            && this.ship?.remainingFuel > 0 
            && time >= this._lastUsedAt + SpaceSim.Constants.Ships.Engines.USAGE_DELAY_MS
            && !this.ship.isOverheating;
    }
}