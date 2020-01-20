import { PoweredModule } from "../powered-module";
import { Ship } from "../../ship";
import { ShipModuleType } from "../ship-module-type";

export class GeneratorModule extends PoweredModule {
    power: number; // generators should have negative power draw representing their production of power
    heatEfficiency: number; // how much heat generated per MegaWatt produced; 1 (100%) means no heat, 0 means 100% heat
    fuelEfficiency: number; // how much fuel consumed per MegaWatt produced in 1 tonne increments per hour; 1 (100%) means no fuel, 0 means 100% fuel
    
    constructor(ship: Ship) {
        super(ship);
        this.setModuleType(ShipModuleType.core);

        this.power = 0;
        this.heatEfficiency = 0; 
        this.fuelEfficiency = 0; 
    }

    getPower(): number {
      return this.power;
    }
    setPower(power: number): GeneratorModule {
        this.power = power;
        return this;
    }

    getHeatEfficiency(): number {
        return this.heatEfficiency;
    }
    setHeatEfficiency(heatEfficiency: number): GeneratorModule {
        this.heatEfficiency = heatEfficiency;
        return this;
    }

    getFuelEfficiency(): number {
        return this.fuelEfficiency;
    }
    setFuelEfficiency(fuelEfficiency: number): GeneratorModule {
        this.fuelEfficiency = fuelEfficiency;
        return this;
    }

    getHeatGeneratedByUsage(megawatts) {
        if (megawatts > this.power) {
          return Infinity; // explosion!!!
        }
        var percent = megawatts / this.power; // what percent of total capacity are we using; 90 MW usage of 100 MW total equals 90%
        return this.getCurrentHeatGenerated() * (percent * (1 - this.heatEfficiency)); // 90% usage at heat efficiency of -1 (-100%) equals 180% of heatGenerated value
    }

    getFuelConsumedPerHourByUsage(megawatts) {
        if (megawatts > this.power) {
          return Infinity; // instantly empty tank!!!
        }
        var percent = megawatts / this.power; // what percent of total capacity are we using
        return percent * (1 - this.fuelEfficiency); // 90% usage at fuel efficiency of 0.75 (75%) equals 0.225 tonnes consumed per hour
    }
}