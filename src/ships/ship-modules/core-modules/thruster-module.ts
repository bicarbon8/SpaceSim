import { Ship } from "../../ship";
import { ShipModuleType } from "../ship-module-type";
import { CoreModule } from "./core-module";

export class ThrusterModule extends CoreModule {
    private thrust: number; // in KiloNewtons
    private afterburnerDraw: number; // Units per second

    constructor(ship: Ship) {
        super(ship);

        this.thrust = 0;
        this.afterburnerDraw = 0;
    }

    /**
     * in KiloNewtons
     */
    getThrust(): number {
        return this.thrust;
    }
    /**
     * 
     * @param thrust value in KiloNewtons
     */
    setThrust(thrust: number): ThrusterModule {
        this.thrust = thrust;
        return this;
    }

    /**
     * units of capacitor consumed per second
     */
    getAfterburnerDraw(): number {
        return this.afterburnerDraw;
    }
    /**
     * 
     * @param draw units of capacitor consumed per second of 
     * afterburner use
     */
    setAfterburnerDraw(draw: number): ThrusterModule {
        this.afterburnerDraw = draw;
        return this;
    }
}