import { ModuleContainer } from "./module-container";
import { ShipModuleType } from "./ship-module-type";
import { ShipModule } from "./ship-module";

export class UtilityModules {
    private modulesContainer: ModuleContainer;

    constructor(size: number) {
        this.modulesContainer = new ModuleContainer(size, ShipModuleType.utility);
    }

    addModule(shipModule: ShipModule): UtilityModules {
        this.modulesContainer.addModule(shipModule);
        return this;
    }

    removeModule(shipModule: ShipModule): UtilityModules {
        this.modulesContainer.removeModule(shipModule);
        return this;
    }
}