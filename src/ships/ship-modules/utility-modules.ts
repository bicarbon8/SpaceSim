import { ModuleContainer } from "./module-container";
import { ShipModuleType } from "./ship-module-type";
import { UtilityModule } from "./utility-modules/utility-module";

export class UtilityModules {
    private modulesContainer: ModuleContainer;

    constructor(size?: number) {
        if (!size) {
            size = 0;
        }
        this.modulesContainer = new ModuleContainer(size, ShipModuleType.utility);
    }

    setSize(size: number): UtilityModules {
        this.modulesContainer.setSize(size);
        return this;
    }

    addModule<T extends UtilityModule>(shipModule: T): UtilityModules {
        this.modulesContainer.addModule(shipModule);
        return this;
    }

    removeModule<T extends UtilityModule>(shipModule: UtilityModule): UtilityModules {
        this.modulesContainer.removeModule(shipModule);
        return this;
    }
}