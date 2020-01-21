import { Ship } from "../../ship";
import { ShipModuleType } from "../ship-module-type";
import { CoreModule } from "./core-module";

export class FuelModule extends CoreModule {
    private capacity: number;
    private currentAmount: number;

    constructor(ship: Ship) {
        super(ship);

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