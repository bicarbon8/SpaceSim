import { BaseScene } from "../../scenes/base-scene";
import { ShipSupply, ShipSupplyOptions } from "./ship-supply";
import { Ship } from "../ship";

export class CoolantSupply extends ShipSupply {
    constructor(scene: BaseScene, options: Omit<ShipSupplyOptions, 'supplyType'>) {
        super(scene, {...options, supplyType: 'coolant'});
    }
    
    override apply(ship: Ship): void {
        if (ship) {
            ship.subtractHeat(this.amount);
        }
        this.destroy();
    }
}