import { GeneratorModule } from "./core-modules/generator-module";
import { ThrusterModule } from "./core-modules/thruster-module";
import { CapacitorModule } from "./core-modules/capacitor-module";
import { FuelModule } from "./core-modules/fuel-module";

export class CoreModules {
    private generatorMaxSize: number;
    private generator: GeneratorModule;

    private thrusterMaxSize: number;
    private thruster: ThrusterModule;

    private capacitorMaxSize: number;
    private capacitor: CapacitorModule;

    private fuelModuleMaxSize: number;
    private fuelModule: FuelModule;

    getTotalMass() {
        var totalMass = 0;

        if (this.fuelModule) {
            totalMass += this.fuelModule.getMass() + // mass of the housing
                        this.fuelModule.getCurrentAmount(); // mass of the fuel
        }
        if (this.generator) { totalMass += this.generator.getMass(); }
        if (this.thruster) { totalMass += this.thruster.getMass(); }
        if (this.capacitor) { totalMass += this.capacitor.getMass(); }

        return totalMass;
    }

    getTotalHeat(): number {
        var totalHeat = 0; // degrees Celcius

        if (this.fuelModule) { totalHeat += this.fuelModule.getCurrentHeatGenerated(); }
        if (this.thruster) { totalHeat += this.thruster.getCurrentHeatGenerated(); }
        if (this.capacitor) { totalHeat += this.capacitor.getCurrentHeatGenerated(); }
        if (this.generator) { totalHeat += this.generator.getHeatGeneratedByUsage(this.getTotalPowerConsumed()); }

        return totalHeat;
    }

    getTotalPowerConsumed(): number {
        var totalPower = 0; // MegaWatts

        if (this.fuelModule) { totalPower += this.fuelModule.getCurrentPowerDraw(); }
        if (this.thruster) { totalPower += this.thruster.getCurrentPowerDraw(); }
        if (this.capacitor) { totalPower += this.capacitor.getCurrentPowerDraw(); }
        // leave off generator as it produces, not consumes power

        return totalPower;
    }

    getGeneratorMaxSize(): number {
        return this.generatorMaxSize;
    }
    setGeneratorMaxSize(max: number): CoreModules {
        this.generatorMaxSize = max;
        return this;
    }

    getGenerator(): GeneratorModule {
        return this.generator;
    }
    setGenerator(generator: GeneratorModule): CoreModules {
        if (generator && generator.getSize() > this.generatorMaxSize) {
            throw `ship cannot equip a Generator Module larger than: '${this.generatorMaxSize}'`;
        }
        this.generator = generator;
        return this;
    }

    getThrusterMaxSize(): number {
        return this.thrusterMaxSize;
    }
    setThrusterMaxSize(max: number): CoreModules {
        this.thrusterMaxSize = max;
        return this;
    }

    getThruster(): ThrusterModule {
        return this.thruster;
    }
    setThruster(thruster: ThrusterModule): CoreModules {
        if (thruster && thruster.getSize() > this.thrusterMaxSize) {
            throw `ship cannot equip a Thruster Module larger than: '${this.thrusterMaxSize}'`;
        }
        this.thruster = thruster;
        return this;
    }

    getCapacitorMaxSize(): number {
        return this.capacitorMaxSize;
    }
    setCapacitorMaxSize(max: number): CoreModules {
        this.capacitorMaxSize = max;
        return this;
    }

    getCapacitor(): CapacitorModule {
        return this.capacitor;
    }
    setCapacitor(capacitor: CapacitorModule): CoreModules {
        if (capacitor && capacitor.getSize() > this.capacitorMaxSize) {
            throw `ship cannot equip a Capacitor Module larger than: '${this.capacitorMaxSize}'`;
        }
        this.capacitor = capacitor;
        return this;
    }

    getFuelModuleMaxSize(): number {
        return this.fuelModuleMaxSize;
    }
    setFuelModuleMaxSize(max: number): CoreModules {
        this.fuelModuleMaxSize = max;
        return this;
    }

    getFuelModule(): FuelModule {
        return this.fuelModule;
    }
    setFuelModule(fuelModule: FuelModule): CoreModules {
        if (fuelModule && fuelModule.getSize() > this.fuelModuleMaxSize) {
            throw `ship cannot equip a Fuel Module larger than: '${this.fuelModuleMaxSize}'`;
        }
        this.fuelModule = fuelModule;
        return this;
    }
}