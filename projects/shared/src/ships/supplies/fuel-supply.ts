import { BaseScene } from "../../scenes/base-scene";
import { ShipSupply, ShipSupplyOptions } from "./ship-supply";
import { Ship } from "../ship";

export class FuelSupply extends ShipSupply {
    constructor(scene: BaseScene, options: Omit<ShipSupplyOptions, 'supplyType'>) {
        super(scene, {...options, supplyType: 'fuel'});
    }

    override apply(ship: Ship): void {
        if (ship) {
            ship.addFuel(this.amount);
        }
        this.destroy();
    }
}