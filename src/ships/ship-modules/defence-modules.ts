import { ModuleContainer } from "./module-container";
import { ShipModuleType } from "./ship-module-type";
import { ShipModule } from "./ship-module";

export class DefenceModules {
    private modulesContainer: ModuleContainer;

    constructor(size: number) {
        this.modulesContainer = new ModuleContainer(size, ShipModuleType.defense);
    }

    addModule(shipModule: ShipModule): DefenceModules {
        this.modulesContainer.addModule(shipModule);
        return this;
    }

    removeModule(shipModule: ShipModule): DefenceModules {
        this.modulesContainer.removeModule(shipModule);
        return this;
    }
}