import { PoweredModule } from "../powered-module";
import { Ship } from "../../ship";
import { ShipModuleType } from "../ship-module-type";

export abstract class DefenceModule extends PoweredModule {
    constructor(ship: Ship) {
        super(ship);
        this.setModuleType(ShipModuleType.defense);
    }
}