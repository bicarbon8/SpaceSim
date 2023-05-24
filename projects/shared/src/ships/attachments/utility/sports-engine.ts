import { BaseScene } from "../../../scenes/base-scene";
import { Engine } from "./engine";

export class SportsEngine extends Engine {
    constructor(scene: BaseScene) {
        super(scene, {
            model: 'sports',
            force: 100,
            fuelPerUse: 0.2,
            heatPerUse: 0.5,
            usageDelay: 50
        });
    }
}