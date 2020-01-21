import { PoweredModule } from "../powered-module";
import { Ship } from "../../ship";
import { ShipModuleType } from "../ship-module-type";

export abstract class UtilityModule extends PoweredModule {
    constructor(ship: Ship) {
        super(ship);
        this.setModuleType(ShipModuleType.utility);
    }
}