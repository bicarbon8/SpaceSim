import { Ship } from "../../ship";
import { DefenceModule } from "./defence-module";

export class RadiatorModule extends DefenceModule {
    private heatDissipationPerSecond: number;

    constructor(ship: Ship) {
        super(ship);
        
        this.heatDissipationPerSecond = 0;
    }

    getHeatDissipationPerSecond(): number {
        return this.heatDissipationPerSecond;
    }
    setHeatDissipationPerSecond(dissipationRate: number): RadiatorModule {
        this.heatDissipationPerSecond = dissipationRate;
        return this;
    }
}