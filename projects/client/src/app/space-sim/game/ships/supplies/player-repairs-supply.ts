import { RepairsSupply, ShipSupplyOptions } from "space-sim-shared";
import { BaseScene } from "space-sim-shared";
import { environment } from "../../../../../environments/environment";
import { SpaceSimClient } from "../../space-sim-client";

export class PlayerRepairsSupply extends RepairsSupply {
    static preload(scene: Phaser.Scene): void {
        scene.load.image('repairs-canister', `${environment.baseUrl}/assets/sprites/repairs-canister.png`);
    }
    
    constructor(scene: BaseScene, options: ShipSupplyOptions) {
        super(scene, options);

        const sprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: 'repairs-canister',
            origin: 0.5
        }, false);
        this.add(sprite)
            .setDepth(SpaceSimClient.Constants.UI.Layers.PLAYER);
    }
}