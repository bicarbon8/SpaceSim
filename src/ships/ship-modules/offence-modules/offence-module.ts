import { PoweredModule } from "../powered-module";
import { Ship } from "../../ship";
import { OffenceModuleSize } from "./offence-module-size";
import { ShipModuleType } from "../ship-module-type";

export abstract class OffenceModule extends PoweredModule {
    offenceModuleSize: OffenceModuleSize;

    constructor(ship: Ship) {
        super(ship);
        this.setModuleType(ShipModuleType.offence);
    }

    getModuleSize(): OffenceModuleSize {
        return this.offenceModuleSize;
    }
    setModuleSize(size: OffenceModuleSize): OffenceModule {
        this.offenceModuleSize = size;
        return this;
    }
}