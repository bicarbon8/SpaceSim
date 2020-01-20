import { PoweredModule } from "../powered-module";
import { Ship } from "../../ship";
import { ShipModuleType } from "../ship-module-type";

export class CapacitorModule extends PoweredModule {
    private capacity: number;
    private chargeRate: number;
    
    constructor(ship: Ship) {
        super(ship);
        this.setModuleType(ShipModuleType.core);

        this.capacity = 0;
        this.chargeRate = 0;
    }

    getCapacity(): number {
        return this.capacity;
    }
    setCapacity(capacity: number): CapacitorModule {
        this.capacity = capacity;
        return this;
    }

    getChargeRate(): number {
        return this.chargeRate;
    }
    setChargeRate(rate: number): CapacitorModule {
        this.chargeRate = rate;
        return this;
    }
}