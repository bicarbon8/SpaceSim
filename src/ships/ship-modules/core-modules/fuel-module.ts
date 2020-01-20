import { PoweredModule } from "../powered-module";
import { Ship } from "../../ship";
import { ShipModuleType } from "../ship-module-type";

export class FuelModule extends PoweredModule {
    private capacity: number;
    private currentAmount: number;

    constructor(ship: Ship) {
        super(ship);
        this.setModuleType(ShipModuleType.core);

        this.capacity = 0;
        this.currentAmount = 0;
    }

    addFuel(amount: number): FuelModule {
        this.currentAmount += amount;
        if (this.currentAmount > this.capacity) {
            this.currentAmount = this.capacity;
        }
        return this;
    }

    getCurrentAmount(): number {
        return this.currentAmount;
    }

    getCapacity(): number {
        return this.capacity;
    }
    setCapacity(capacity: number): FuelModule {
        this.capacity = capacity;
        return this;
    }

    consumeFuel(amount: number): FuelModule {
        this.currentAmount -= amount;
        if (this.currentAmount < 0) {
            this.currentAmount = 0;
        }
        return this;
    }
}