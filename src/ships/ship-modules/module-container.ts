import { ShipModule } from "./ship-module";
import { ShipModuleType } from "./ship-module-type";

export class ModuleContainer {
    private accepts: ShipModuleType[];
    private size: number;
    private shipModules: ShipModule[];

    constructor(size: number, ...accepts: ShipModuleType[]) {
        this.size = size;
        this.shipModules = [];
        this.accepts = accepts;
    }

    setSize(size: number): ModuleContainer {
        this.size = size;
        return this;
    }

    addModule<T extends ShipModule>(shipModule: T): ModuleContainer {
        if (shipModule.getSize() <= this.getRemainingSpace() && this.isAcceptedType(shipModule.getModuleType())) {
            this.shipModules.push(shipModule);
        }
        return this;
    }

    removeModule<T extends ShipModule>(shipModule: T): ModuleContainer {
        for (var i=0; i<this.shipModules.length; i++) {
            let m: ShipModule = this.shipModules[i];
            if (m.getId() == shipModule.getId()) {
                this.shipModules.splice(i, 1);
                break;
            }
        }
        return this;
    }

    getRemainingSpace(): number {
        let used = 0;
        for (var i=0; i<this.shipModules.length; i++) {
            let m: ShipModule = this.shipModules[i];
            if (m) {
                used += m.getSize();
            }
        }
        return this.size - used;
    }

    getTotalMass(): number {
        let mass: number = 0; // tonnes
        for (var i=0; i<this.shipModules.length; i++) {
            mass += this.shipModules[i].getMass();
        }
        return mass;
    }

    private isAcceptedType(moduleType: ShipModuleType): boolean {
        for (var i=0; i<this.accepts.length; i++) {
            if (moduleType != this.accepts[i]) {
                return false;
            }
        }
        return true;
    }
}