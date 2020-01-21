import { Ship } from "../../ship";
import { DefenceModule } from "./defence-module";

export class HullPlating extends DefenceModule {
    private impactResistanceModifier: number;
    private heatResistanceModifier: number;

    constructor(ship: Ship) {
        super(ship);
        
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