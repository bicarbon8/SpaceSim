import { PoweredModule } from "../powered-module";
import { ShipModuleType } from "../ship-module-type";
import { Ship } from "../../ship";

export class RadiatorModule extends PoweredModule {
    private heatDissipationPerSecond: number;

    constructor(ship: Ship) {
        super(ship);
        this.setModuleType(ShipModuleType.defense);
        
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