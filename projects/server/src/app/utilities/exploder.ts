import { ShipOptions } from "../ships/ship-options";
import { AmmoSupply } from "../ships/supplies/ammo-supply";
import { CoolantSupply } from "../ships/supplies/coolant-supply";
import { FuelSupply } from "../ships/supplies/fuel-supply";
import { RepairsSupply } from "../ships/supplies/repairs-supply";
import { ShipSupply } from "../ships/supplies/ship-supply";
import { Constants } from "./constants";
import { Helpers } from "./helpers";

export type ExploderOptions = {
    scale?: number;
    location: Phaser.Types.Math.Vector2Like;
}

export class Exploder {
    public readonly scene: Phaser.Scene;

    private _destroyedSound: Phaser.Sound.BaseSound;
    private _flareParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private _explosionParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitterManager;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        Helpers.trycatch(() => this._destroyedSound = this.scene.sound.add('explosion', {volume: 0.1}),
            'warn', 'unable to load explosion sound', false);
        Helpers.trycatch(() => this._flareParticleEmitter = this.scene.add.particles('flares'),
            'warn', 'unable to load flares sprite as particles', false);
        Helpers.trycatch(() => this._explosionParticleEmitter = this.scene.add.particles('explosion'),
            'warn', 'unable to load explosion sprite as particles', false);
    }

    explode(options: ExploderOptions): this {
        // create particle systems for destruction
        this._flareParticleEmitter.setPosition(options.location.x, options.location.y);
        this._flareParticleEmitter.setDepth(Constants.UI.Layers.PLAYER);
        this._explosionParticleEmitter.setPosition(options.location.x, options.location.y);
        this._explosionParticleEmitter.setDepth(Constants.UI.Layers.PLAYER);

        Helpers.trycatch(() => this._destroyedSound.play(), 'none');

        this._explosionParticleEmitter.createEmitter({
            lifespan: { min: 500, max: 1000 },
            speedX: { min: -1, max: 1 },
            speedY: { min: -1, max: 1 },
            angle: { min: -180, max: 179 },
            gravityX: 0,
            gravityY: 0,
            scale: { start: options.scale ?? 1, end: 0 },
            blendMode: 'ADD',
            maxParticles: 3
        });
        this._flareParticleEmitter.createEmitter({
            frame: Constants.UI.SpriteMaps.Flares.red as number,
            lifespan: { min: 100, max: 500 },
            speedX: { min: -600, max: 600 },
            speedY: { min: -600, max: 600 },
            angle: { min: -180, max: 179 },
            gravityX: 0,
            gravityY: 0,
            scale: { start: options.scale ?? 1, end: 0 },
            blendMode: 'ADD',
            maxParticles: 10
        });

        return this;
    }

    emitSupplies(shipOpts: ShipOptions): Array<ShipSupply> {
        const supplies = new Array<ShipSupply>();
        const loc = shipOpts.location;
        let remainingFuel = shipOpts.remainingFuel / 2;
        const fuelContainersCount = Phaser.Math.RND.between(1, remainingFuel / Constants.Ship.MAX_FUEL_PER_CONTAINER);
        for (var i=0; i<fuelContainersCount; i++) {
            const amount = (remainingFuel > Constants.Ship.MAX_FUEL_PER_CONTAINER) 
                ? Constants.Ship.MAX_FUEL_PER_CONTAINER 
                : remainingFuel;
            remainingFuel -= amount;
            const supply = new FuelSupply(this.scene, {
                amount: amount,
                location: loc
            });
            supplies.push(supply);
        }
        let remainingAmmo = shipOpts.remainingAmmo / 2;
        const ammoContainersCount = Phaser.Math.RND.between(1, remainingAmmo / Constants.Ship.Weapons.MAX_AMMO_PER_CONTAINER);
        for (var i=0; i<ammoContainersCount; i++) {
            const amount = (remainingAmmo > Constants.Ship.Weapons.MAX_AMMO_PER_CONTAINER) 
                ? Constants.Ship.Weapons.MAX_AMMO_PER_CONTAINER 
                : remainingAmmo;
            remainingAmmo -= amount;
            const supply = new AmmoSupply(this.scene, {
                amount: amount,
                location: loc
            });
            supplies.push(supply);
        }
        if (Phaser.Math.RND.between(0, 1)) {
            const supply = new CoolantSupply(this.scene, {
                amount: 40,
                location: loc
            });
            supplies.push(supply);
        }
        if (Phaser.Math.RND.between(0, 1)) {
            const supply = new RepairsSupply(this.scene, {
                amount: 20,
                location: loc
            });
            supplies.push(supply);
        }

        return supplies;
    }
}