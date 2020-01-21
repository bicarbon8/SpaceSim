import { ModuleContainer } from "./module-container";
import { ShipModuleType } from "./ship-module-type";
import { DefenceModule } from "./defence-modules/defence-module";

export class DefenceModules {
    private modulesContainer: ModuleContainer;

    constructor(size?: number) {
        if (!size) {
            size = 0;
        }
        this.modulesContainer = new ModuleContainer(size, ShipModuleType.defense);
    }

    setSize(size: number): DefenceModules {
        this.modulesContainer.setSize(size);
        return this;
    }

    addModule<T extends DefenceModule>(mod: T): DefenceModules {
        this.modulesContainer.addModule(mod);
        return this;
    }

    removeModule<T extends DefenceModule>(mod: T): DefenceModules {
        this.modulesContainer.removeModule(mod);
        return this;
    }
}