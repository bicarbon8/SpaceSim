import { ShipLike } from "../../interfaces/ship-like";
import { ShipSupply, ShipSupplyOptions } from "./ship-supply";

export class RepairsSupply extends ShipSupply {
    constructor(scene: Phaser.Scene, options: Omit<ShipSupplyOptions, 'supplyType'>) {
        super(scene, {...options, supplyType: 'repairs'});
    }

    override apply(ship: ShipLike): void {
        if (ship) {
            ship.repair(this.amount);
        }
        this.destroy();
    }
    
    protected _createChildren(): this {
        const sprite = this.scene.make.sprite({
            key: 'repairs-canister',
            origin: 0.5
        }, false);
        this.add(sprite);
        
        return this;
    }
}