import { Ship } from "../ship";
import { ShipSupply } from "./ship-supply";

export class AmmoSupply extends ShipSupply {
    override apply(ship: Ship): void {
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