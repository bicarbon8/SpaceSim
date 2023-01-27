import { BaseScene } from "../../../scenes/base-scene";
import { Engine } from "./engine";

export class StandardEngine extends Engine {
    constructor(scene: BaseScene) {
        super(scene, {
            model: 'standard',
            force: 50,
            fuelPerUse: 0.1,
            heatPerUse: 0.2,
            usageDelay: 100
        });
    }
}