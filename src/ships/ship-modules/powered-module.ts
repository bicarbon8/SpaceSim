import { ShipModule } from "./ship-module";
import { Ship } from "../ship";

export abstract class PoweredModule extends ShipModule {
    private enabled: boolean;
    private active: boolean;
    private powerDraw: number;
    private activePowerDraw: number;
    private heatGenerated: number;
    private activeHeatGenerated: number;

    constructor(ship: Ship) {
        super(ship);
    }

    isEnabled(): boolean {
        return this.enabled;
    }
    setEnabled(enabled: boolean): PoweredModule {
        this.enabled = enabled;
        return this;
    }

    isActive(): boolean {
        return this.active;
    }
    setActive(active: boolean): PoweredModule {
        this.active = active;
        return this;
    }

    setPowerDraw(powerDraw?: number, activePowerDraw?: number): PoweredModule {
        if (powerDraw) {
            this.powerDraw = powerDraw;
        }
        if (activePowerDraw) {
            this.activePowerDraw = activePowerDraw;
        }
        return this;
    }
    getCurrentPowerDraw(): number {
        if (this.isEnabled()) {
            let draw = this.powerDraw;
            if (this.isActive()) {
                draw += this.activePowerDraw;
            }
            return draw;
        }
        return 0;
    }

    setHeatGenerated(heatGenerated?: number, activeHeatGenerated?: number): PoweredModule {
        if (heatGenerated) {
            this.heatGenerated = heatGenerated;
        }
        if (activeHeatGenerated) {
            this.activeHeatGenerated = activeHeatGenerated;
        }
        return this;
    }
    getCurrentHeatGenerated(): number {
        if (this.isEnabled()) {
            let heat = this.heatGenerated;
            if (this.isActive()) {
                heat += this.activeHeatGenerated;
            }
            return heat;
        }
        return 0;
    }
}