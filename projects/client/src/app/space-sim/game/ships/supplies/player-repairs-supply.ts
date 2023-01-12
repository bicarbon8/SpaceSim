import { RepairsSupply, ShipSupplyOptions } from "space-sim-shared";
import { BaseScene } from "space-sim-shared";

export class PlayerRepairsSupply extends RepairsSupply {
    constructor(scene: BaseScene, options: ShipSupplyOptions) {
        super(scene, options);

        const sprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: 'repairs-canister',
            origin: 0.5
        }, false);
        this.add(sprite);
    }
}