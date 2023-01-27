import { BaseScene, FuelSupply, ShipSupplyOptions } from "space-sim-shared";
import { environment } from "../../../../../environments/environment";
import { SpaceSimClient } from "../../space-sim-client";

export class PlayerFuelSupply extends FuelSupply {
    static preload(scene: Phaser.Scene): void {
        scene.load.image('fuel-canister', `${environment.baseUrl}/assets/sprites/fuel-canister.png`);
    }
    
    constructor(scene: BaseScene, options: ShipSupplyOptions) {
        super(scene, options);

        const sprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: 'fuel-canister',
            origin: 0.5
        }, false);
        this.add(sprite)
            .setDepth(SpaceSimClient.Constants.UI.Layers.PLAYER);
    }
}