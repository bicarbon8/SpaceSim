import { PoweredModule } from "../powered-module";
import { ShipModuleType } from "../ship-module-type";
import { Ship } from "../../ship";

export class HullPlating extends PoweredModule {
    private impactResistanceModifier: number;
    private heatResistanceModifier: number;

    constructor(ship: Ship) {
        super(ship);
        this.setModuleType(ShipModuleType.defense);

        this.impactResistanceModifier = 0;
        this.heatResistanceModifier = 0;
    }

    getImpactResistanceModifier(): number {
        return this.impactResistanceModifier;
    }
    setImpactResistanceModifier(resistanceModifier: number): HullPlating {
        this.impactResistanceModifier = resistanceModifier;
        return this;
    }

    getHeatResistanceModifer(): number {
        return this.heatResistanceModifier;
    }
    setHeatResistanceModifier(resistanceModifier: number): HullPlating {
        this.heatResistanceModifier = resistanceModifier;
        return this;
    }
}