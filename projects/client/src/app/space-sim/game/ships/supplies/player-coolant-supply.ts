import { BaseScene, CoolantSupply, ShipSupplyOptions } from "space-sim-shared"

export class PlayerCoolantSupply extends CoolantSupply {
    constructor(scene: BaseScene, options: ShipSupplyOptions) {
        super(scene, options);

        const sprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: 'coolant-canister',
            origin: 0.5
        }, false);
        this.add(sprite);
    }
}