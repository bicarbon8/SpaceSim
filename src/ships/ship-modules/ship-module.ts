import { ShipModuleType} from "./ship-module-type";
import { ShipModuleClass } from "./ship-module-class";
import { RNG } from "../../utilities/rng";
import { Ship } from "../ship";

export abstract class ShipModule {
    private ship: Ship;
    private id: string;
    private name: string;
    private description: string;
    private moduleType: ShipModuleType;
    private mass: number;
    private size: number;
    private moduleClass: ShipModuleClass;
    private heatResistance: number;
    private impactResistance: number;
    private integrity: number;
    private cost: number;
    
    constructor(ship: Ship) {
        this.ship = ship;
        this.id = RNG.guid();
        this.integrity = 100; // fully healthy
    }

    getShip(): Ship {
        return this.ship;
    }
    setShip<T extends Ship>(ship: T): ShipModule {
        this.ship = ship;
        return this;
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }
    setName(name: string): ShipModule {
        this.name = name;
        return this;
    }

    getDescription(): string {
        return this.description;
    }
    setDescription(description: string): ShipModule {
        this.description = description;
        return this;
    }
    
    getModuleType(): ShipModuleType {
        return this.moduleType;
    }
    setModuleType(moduleType: ShipModuleType): ShipModule {
        this.moduleType = moduleType;
        return this;
    }

    /**
     * value in tonnes
     */
    getMass(): number {
        return this.mass;
    }
    setMass(mass: number): ShipModule {
        this.mass = mass;
        return this;
    }

    /**
     * in cubic metres
     */
    getSize(): number {
        return this.size;
    }
    setSize(size: number): ShipModule {
        this.size = size;
        return this;
    }

    getModuleClass(): ShipModuleClass {
        return this.moduleClass;
    }
    setModuleClass(moduleClass: ShipModuleClass): ShipModule {
        this.moduleClass = moduleClass;
        return this;
    }

    /**
     * lazer weapon, ship overheating and star proximity resistance: 
     * 100 is immune to heat; 0 is 100% vulnerable to heat
     */
    getHeatResistance(): number {
        return this.heatResistance;
    }
    setHeatResistance(heatResistance: number): ShipModule {
        this.heatResistance = heatResistance;
        return this;
    }

    /**
     * collisions, bullets / shrapnel resistance: 
     * 100 is immune to impacts; 0 is 100% vulnerable to impacts
     */
    getImpactResistance(): number {
        return this.impactResistance;
    }
    setImpactResistance(impactResistance: number): ShipModule {
        this.impactResistance = impactResistance;
        return this;
    }

    /**
     * 100 is healthy, 0 is broken and must be repaired. 
     * New modules start at 100 whereas used may start at
     * any value. The lower the integrity the higher the
     * chance of failure when used
     */
    getIntegrity(): number {
        return this.integrity;
    }
    inflictDamage(amount: number): ShipModule {
        this.integrity -= amount;
        if (this.integrity < 0) {
            this.integrity = 0;
        }
        // TODO: signal broken
        return this;
    }
    repair(): ShipModule {
        this.integrity = 100;
        return this;
    }

    getCost(): number {
        return this.cost;
    }
    setCost(cost: number): ShipModule {
        this.cost = cost;
        return this;
    }
}