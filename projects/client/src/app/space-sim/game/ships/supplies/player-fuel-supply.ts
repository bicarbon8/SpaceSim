import { BaseScene, FuelSupply, ShipSupplyOptions } from "space-sim-shared";

export class PlayerFuelSupply extends FuelSupply {
    constructor(scene: BaseScene, options: ShipSupplyOptions) {
        super(scene, options);

        const sprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: 'fuel-canister',
            origin: 0.5
        }, false);
        this.add(sprite);
    }
}