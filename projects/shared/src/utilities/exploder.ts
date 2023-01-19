import { ShipConfig } from "../ships/ship";
import { ShipSupplyOptions } from "../ships/supplies/ship-supply";
import { Constants } from "./constants";

export type ExploderOptions = {
    scale?: number;
    location: Phaser.Types.Math.Vector2Like;
}

export class Exploder {
    public readonly scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    explode(options: ExploderOptions): this {
        return this;
    }

    emitSupplies(shipOpts: ShipConfig): Array<ShipSupplyOptions> {
        const supplies = new Array<ShipSupplyOptions>();
        const loc = shipOpts.location;
        let remainingFuel = shipOpts.remainingFuel / 2;
        const fuelContainersCount = Phaser.Math.RND.between(1, remainingFuel / Constants.Ship.MAX_FUEL_PER_CONTAINER);
        for (var i=0; i<fuelContainersCount; i++) {
            const amount = (remainingFuel > Constants.Ship.MAX_FUEL_PER_CONTAINER) 
                ? Constants.Ship.MAX_FUEL_PER_CONTAINER 
                : remainingFuel;
            remainingFuel -= amount;
            const supply: ShipSupplyOptions = {
                supplyType: 'fuel',
                amount: amount,
                location: loc
            };
            supplies.push(supply);
        }
        let remainingAmmo = shipOpts.remainingAmmo / 2;
        const ammoContainersCount = Phaser.Math.RND.between(1, remainingAmmo / Constants.Ship.Weapons.MAX_AMMO_PER_CONTAINER);
        for (var i=0; i<ammoContainersCount; i++) {
            const amount = (remainingAmmo > Constants.Ship.Weapons.MAX_AMMO_PER_CONTAINER) 
                ? Constants.Ship.Weapons.MAX_AMMO_PER_CONTAINER 
                : remainingAmmo;
            remainingAmmo -= amount;
            const supply: ShipSupplyOptions = {
                supplyType: 'ammo',
                amount: amount,
                location: loc
            };
            supplies.push(supply);
        }
        if (Phaser.Math.RND.between(0, 1)) {
            const supply: ShipSupplyOptions = {
                supplyType: 'coolant',
                amount: 40,
                location: loc
            };
            supplies.push(supply);
        }
        if (Phaser.Math.RND.between(0, 1)) {
            const supply: ShipSupplyOptions = {
                supplyType: 'repairs',
                amount: 20,
                location: loc
            };
            supplies.push(supply);
        }

        return supplies;
    }
}