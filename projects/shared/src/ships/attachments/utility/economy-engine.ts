import { BaseScene } from "../../../scenes/base-scene";
import { Engine } from "./engine";

export class EconomyEngine extends Engine {
    constructor(scene: BaseScene) {
        super(scene, {
            model: 'economy',
            force: 25,
            fuelPerUse: 0.01,
            heatPerUse: 0.1,
            usageDelay: 100
        });
    }
}