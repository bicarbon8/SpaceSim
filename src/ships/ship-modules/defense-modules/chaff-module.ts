import { PoweredModule } from "../powered-module";
import { ShipModuleType } from "../ship-module-type";
import { Ship } from "../../ship";

export class ChaffModule extends PoweredModule {
    private maxAmmo: number;
    private ammoRemaining: number;

    constructor(ship: Ship) {
        super(ship);
        this.setModuleType(ShipModuleType.defense);

        this.maxAmmo = 0;
        this.ammoRemaining = 0;
    }

    getMaxAmmo(): number {
        return this.maxAmmo;
    }
    setMaxAmmo(max: number): ChaffModule {
        this.maxAmmo = max;
        return this;
    }

    getAmmoRemaining(): number {
        return this.ammoRemaining;
    }
    
    reload(): ChaffModule {
        this.ammoRemaining = this.maxAmmo;
        return this;
    }

    deploy(): ChaffModule {
        if (this.ammoRemaining > 0) {
            this.ammoRemaining--;
        } else {
            // TODO: signal empty
        }
        return this;
    }
}