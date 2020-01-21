import { CoreModules } from "./ship-modules/core-modules";
import { DefenceModules } from "./ship-modules/defence-modules";
import { OffenceModules } from "./ship-modules/offence-modules";
import { UtilityModules } from "./ship-modules/utility-modules";
import { RNG } from "../utilities/rng";

export class Ship {
    private id: string; // UUID
    private manufacturer: string;
    private coreModules: CoreModules;
    private defenceModules: DefenceModules;
    private offenceModules: OffenceModules;
    private utilityModules: UtilityModules;

    constructor() {
        this.id = RNG.guid();
        this.coreModules = new CoreModules();
        this.defenceModules = new DefenceModules();
        this.offenceModules = new OffenceModules();
        this.utilityModules = new UtilityModules();
    }

    getId(): string {
        return this.id;
    }

    getManufacturer(): string {
        return this.manufacturer;
    }
    setManufacturer(manufacturer: string): Ship {
        this.manufacturer = manufacturer;
        return this;
    }

    getCoreModules(): CoreModules {
        return this.coreModules;
    }

    getDefenceModules(): DefenceModules {
        return this.defenceModules;
    }

    getOffenceModules(): OffenceModules {
        return this.offenceModules;
    }

    getUtilityModules(): UtilityModules {
        return this.utilityModules;
    }
}