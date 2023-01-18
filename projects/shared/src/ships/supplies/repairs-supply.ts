import { BaseScene } from "../../scenes/base-scene";
import { ShipSupply, ShipSupplyOptions } from "./ship-supply";
import { Ship } from "../ship";

export class RepairsSupply extends ShipSupply {
    constructor(scene: BaseScene, options: Omit<ShipSupplyOptions, 'supplyType'>) {
        super(scene, {...options, supplyType: 'repairs'});
    }

    override apply(ship: Ship): void {
        if (ship) {
            ship.addIntegrity(this.amount);
        }
        this.destroy();
    }
}