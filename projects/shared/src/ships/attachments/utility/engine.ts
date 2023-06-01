import { SpaceSim } from "../../../space-sim";
import { BaseScene } from "../../../scenes/base-scene";
import { ShipAttachment } from "../ship-attachment";
import { EngineModel } from "./engine-model";

export type EngineOptions = {
    model: EngineModel;
    force: number;
    fuelPerUse: number;
    heatPerUse: number;
    usageDelay: number;
};

export abstract class Engine extends ShipAttachment {
    private _lastUsedAt: number;

    readonly model: EngineModel;
    readonly force: number;
    readonly fuelPerUse: number;
    readonly heatPerUse: number;
    readonly usageDelayMs: number;
    
    constructor(scene: BaseScene, options: EngineOptions) {
        super(scene);
        this.model = options.model ?? 'invalid';
        this.force = options.force ?? 0;
        this.fuelPerUse = options.fuelPerUse ?? Infinity;
        this.heatPerUse = options.heatPerUse ?? Infinity;
        this.usageDelayMs = options.usageDelay ?? Infinity;
        this._lastUsedAt = 0;
    }

    override setEnabled(enabled: boolean): void {
        super.setEnabled(enabled);
    }

    update(time: number, delta: number): void {
        if (this._canThrust(time)) {
            this._applyThrust(time);
        }
    }

    private _applyThrust(time: number): void {
        this._lastUsedAt = time;
        const heading = this.ship?.heading;
        let deltaV: Phaser.Math.Vector2 = heading.multiply(new Phaser.Math.Vector2(this.force, this.force));
        let newV: Phaser.Math.Vector2 = this.ship.body.velocity.clone().add(deltaV);
        this.ship?.body?.setVelocity(newV.x, newV.y);
        this.ship?.subtractFuel(this.fuelPerUse);
        this.ship?.addHeat(this.heatPerUse);
    }

    private _canThrust(time: number): boolean {
        return this.enabled
            && this.ship?.remainingFuel > 0 
            && time >= this._lastUsedAt + this.usageDelayMs
            && !this.ship.isOverheating;
    }
}