import { ShipLike } from "../../interfaces/ship-like";
import { ShipSupply, ShipSupplyOptions } from "./ship-supply";

export class AmmoSupply extends ShipSupply {
    constructor(scene: Phaser.Scene, options: Omit<ShipSupplyOptions, 'supplyType'>) {
        super(scene, {...options, supplyType: 'ammo'});
    }

    override apply(ship: ShipLike): void {
        if (ship) {
            const oa = ship.getWeapons();
            oa?.addAmmo(this.amount);
        }
        this.destroy();
    }
    
    protected _createChildren(): this {
        const sprite = this.scene.make.sprite({
            key: 'ammo',
            origin: 0.5
        }, false);
        this.add(sprite);
        
        return this;
    }
}