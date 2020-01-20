import { OffenceModule } from "./offence-modules/offence-module";
import { ShipModuleType } from "./ship-module-type";
import { OffenceModuleSize } from "./offence-modules/offence-module-size";

export class OffenceModules {
    smallCount: number;
    mediumCount: number;
    largeCount: number;
    hugeCount: number;
    smallModules: OffenceModule[];
    mediumModules: OffenceModule[];
    largeModules: OffenceModule[];
    hugeModules: OffenceModule[];

    constructor(smallCount: number, mediumCount: number, largeCount: number, hugeCount: number) {
        this.smallCount = smallCount;
        this.mediumCount = mediumCount;
        this.largeCount = largeCount;
        this.hugeCount = hugeCount;
        this.smallModules = [];
        this.mediumModules = [];
        this.largeModules = [];
        this.hugeModules = [];
    }

    addSmallModule<T extends OffenceModule>(mod: T): OffenceModules {
        if (this.smallModules.length < this.smallCount) {
            if (this.isExpectedSize(OffenceModuleSize.small, mod)) {
                this.smallModules.push(mod);
            }
        }
        return this;
    }

    private isExpectedSize<T extends OffenceModule>(expected: OffenceModuleSize, mod: T): boolean {
        if (mod.getModuleSize() == expected) {
            return true;
        }
        return false;
    }
}