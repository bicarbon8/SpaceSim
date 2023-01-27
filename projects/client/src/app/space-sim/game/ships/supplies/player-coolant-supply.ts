import { BaseScene, CoolantSupply, ShipSupplyOptions } from "space-sim-shared"
import { environment } from "../../../../../environments/environment";
import { SpaceSimClient } from "../../space-sim-client";

export class PlayerCoolantSupply extends CoolantSupply {
    static preload(scene: Phaser.Scene): void {
        scene.load.image('coolant-canister', `${environment.baseUrl}/assets/sprites/coolant-canister.png`);
    }
    
    constructor(scene: BaseScene, options: ShipSupplyOptions) {
        super(scene, options);

        const sprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: 'coolant-canister',
            origin: 0.5
        }, false);
        this.add(sprite)
            .setDepth(SpaceSimClient.Constants.UI.Layers.PLAYER);
    }
}