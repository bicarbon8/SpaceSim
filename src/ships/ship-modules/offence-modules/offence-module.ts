import { PoweredModule } from "../powered-module";
import { Ship } from "../../ship";
import { OffenceModuleSize } from "./offence-module-size";
import { ShipModuleType } from "../ship-module-type";
import { OffenceModuleType } from "./offence-module-type";

export abstract class OffenceModule extends PoweredModule {
    offenceModuleSize: OffenceModuleSize;
    offenceModuleType: OffenceModuleType;
    ammoMax: number;
    ammoCurrent: number;

    constructor(ship: Ship) {
        super(ship);
        this.setModuleType(ShipModuleType.offence);

        this.ammoMax = 0;
        this.ammoCurrent = 0;
    }

    getModuleSize(): OffenceModuleSize {
        return this.offenceModuleSize;
    }
    setModuleSize(size: OffenceModuleSize): OffenceModule {
        this.offenceModuleSize = size;
        return this;
    }

    getOffenceModuleType(): OffenceModuleType {
        return this.offenceModuleType;
    }
    setOffenceModuleType(t: OffenceModuleType): OffenceModule {
        this.offenceModuleType = t;
        return this;
    }

    getAmmoMax(): number {
        return this.ammoMax;
    }
    setAmmoMax(max: number): OffenceModule {
        this.ammoMax = max;
        return this;
    }

    getAmmoCurrent(): number {
        if (this.offenceModuleType == OffenceModuleType.heat) {
            return Infinity;
        } else {
            return this.ammoCurrent;
        }
    }
    reload(): OffenceModule {
        if (this.offenceModuleType != OffenceModuleType.heat) {
            this.ammoCurrent = this.ammoMax;
        }
        return this;
    }
    fire(): OffenceModule {
        if (this.offenceModuleType != OffenceModuleType.heat) {
            this.ammoCurrent--;
        }
        return this;
    }
}