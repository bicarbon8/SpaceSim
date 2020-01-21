import { Ship } from "../../ship";
import { DefenceModule } from "./defence-module";

export class ChaffModule extends DefenceModule {
    private maxAmmo: number;
    private ammoRemaining: number;

    constructor(ship: Ship) {
        super(ship);
        
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