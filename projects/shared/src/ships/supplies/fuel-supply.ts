import { BaseScene } from "../../scenes/base-scene";
import { ShipLike } from "../../interfaces/ship-like";
import { ShipSupply, ShipSupplyOptions } from "./ship-supply";

export class FuelSupply extends ShipSupply {
    constructor(scene: BaseScene, options: Omit<ShipSupplyOptions, 'supplyType'>) {
        super(scene, {...options, supplyType: 'fuel'});
    }

    override apply(ship: ShipLike): void {
        if (ship) {
            ship.addFuel(this.amount);
        }
        this.destroy();
    }
}