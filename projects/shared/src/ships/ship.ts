import * as Phaser from "phaser";
import { Helpers } from "../utilities/helpers";
import { Engine } from "./attachments/utility/engine";
import { DamageMetadata } from '../interfaces/damage-metadata';
import { Weapon } from "./attachments/offence/weapon";
import { HasState } from "../interfaces/has-state";
import { PhysicsObject } from "../interfaces/physics-object";
import { BaseScene } from "../scenes/base-scene";
import { HasId } from "../interfaces/has-id";
import { HasLocation } from "../interfaces/has-location";
import { SpaceSim } from "../space-sim";
import { WeaponModel } from "./attachments/offence/weapon-model";
import { EngineModel } from "./attachments/utility/engine-model";
import { TryCatch } from "../utilities/try-catch";

export type ShipState = PhysicsObject & {
    id: string;
    name: string;
    integrity: number;
    remainingFuel: number;
    remainingAmmo: number;
    temperature: number;
    mass: number;
    weaponsKey: number;
    wingsKey: number;
    cockpitKey: number;
    engineKey: number;
    weaponModel: WeaponModel;
    engineModel: EngineModel;
};

export type ShipOptions = Partial<ShipState> & {
    engine: Engine | (new (scene: BaseScene) => Engine);
    weapon: Weapon | (new (scene: BaseScene) => Weapon);
};

export class Ship extends Phaser.GameObjects.Container implements HasId, HasLocation, HasState<ShipState> {
    /** ShipOptions */
    readonly name: string;
    
    private readonly _lastDamagedBy: Array<DamageMetadata>;
    
    private _id: string; // UUID
    private _temperature: number = 0; // in Celcius
    private _integrity: number = 0;
    private _remainingFuel: number = 0;
    private _weaponsKey: number;
    private _wingsKey: number;
    private _cockpitKey: number;
    private _engineKey: number;

    private _engine: Engine;
    private _weapon: Weapon;

    private _rotationContainer: Phaser.GameObjects.Container; // used for rotation
    
    /**
     * gets or sets the time in milliseconds that we should
     * destroy this ship
     */
    destroyAtTime: number;

    // override property types
    public scene: BaseScene
    public body: Phaser.Physics.Arcade.Body;
    
    constructor(scene: BaseScene, options: ShipOptions) {
        super(scene, options.location?.x, options.location?.y);
        this.name = options.name;

        this._lastDamagedBy = new Array<DamageMetadata>();

        // create ship-pod sprite, group and container
        this._createGameObj(options);

        this.setEngine(options.engine);
        this.setWeapon(options.weapon);
        
        this.setCurrentState(options);
    }

    get id(): string {
        return this._id;
    }

    setCurrentState(state: Partial<ShipState>): this {
        if (this.active) {
            this._id = state.id ?? Phaser.Math.RND.uuid();
            const loc = state.location ?? Helpers.vector2();
            this.setPosition(loc.x, loc.y);
            const v = state.velocity ?? Helpers.vector2();
            this.body.setVelocity(v.x, v.y);
            const angle = state.angle ?? 0;
            this.rotationContainer.setAngle(angle);
            const newIntegrity = state.integrity ?? SpaceSim.Constants.Ships.MAX_INTEGRITY;
            const oldIntegrity = this.integrity ?? 0;
            (oldIntegrity > newIntegrity) ? this.subtractIntegrity(oldIntegrity - newIntegrity) : this.addIntegrity(newIntegrity - oldIntegrity);
            const newFuel = state.remainingFuel ?? SpaceSim.Constants.Ships.MAX_FUEL;
            const oldFuel = this.remainingFuel ?? 0;
            (oldFuel > newFuel) ? this.subtractFuel(oldFuel - newFuel) : this.addFuel(newFuel - oldFuel);
            const newAmmo = state.remainingAmmo ?? SpaceSim.Constants.Ships.Weapons.MAX_AMMO;
            const oldAmmo = this.weapon.remainingAmmo;
            (oldAmmo > newAmmo) ? this.weapon.remainingAmmo = oldAmmo - newAmmo : this.weapon.addAmmo(newAmmo - oldAmmo);
            const newTemp = state.temperature ?? 0;
            const oldTemp = this.temperature;
            (oldTemp > newTemp) ? this.subtractHeat(oldTemp - newTemp) : this.addHeat(newTemp - oldTemp);
        }
        return this;
    }

    get currentState(): ShipState {
        return {
            id: this.id,
            location: this.location,
            velocity: {x: this.body.velocity.x, y: this.body.velocity.y},
            angle: this.rotationContainer.angle,
            angularVelocity: 0,
            integrity: this.integrity,
            remainingFuel: this.remainingFuel,
            remainingAmmo: this.weapon.remainingAmmo,
            temperature: this.temperature,
            mass: this.body.mass,
            name: this.name,
            weaponsKey: this.weaponsKey,
            wingsKey: this.wingsKey,
            cockpitKey: this.cockpitKey,
            engineKey: this.engineKey,
            weaponModel: this.weapon.model,
            engineModel: this.engine.model
        };
    }

    get rotationContainer(): Phaser.GameObjects.Container {
        return this._rotationContainer;
    }

    get weaponsKey(): number {
        return this._weaponsKey;
    }

    get wingsKey(): number {
        return this._wingsKey;
    }

    get cockpitKey(): number {
        return this._cockpitKey;
    }

    get engineKey(): number {
        return this._engineKey;
    }

    /**
     * the remaining "health" of this ship
     */
    get integrity(): number {
        return this._integrity;
    }

    /**
     * the number of litres of fuel remaining in this ship
     */
    get remainingFuel(): number {
        return this._remainingFuel;
    }

    /**
     * the temperature of this ship in degrees Celcius
     */
    get temperature(): number {
        return this._temperature;
    }

    /**
     * a copy of the Array of `DamageOptions` listing objects that caused
     * damage to this ship
     */
    get damageSources(): Array<DamageMetadata> {
        return this._lastDamagedBy
            .map(d => {
                return {...d} as DamageMetadata;
            });
    }

    setEngine(engine: Engine | (new (scene: BaseScene) => Engine)): this {
        if (typeof engine === 'function') {
            this._engine = new engine(this.scene);
        } else {
            this._engine = engine;
        }
        this.engine.setShip(this);
        return this;
    }

    get engine(): Engine {
        return this._engine;
    }

    setWeapon(weapon: Weapon | (new (scene: BaseScene) => Weapon)): this {
        if (typeof weapon === 'function') {
            this._weapon = new weapon(this.scene);
        } else {
            this._weapon = weapon;
        }
        this.weapon.setShip(this);
        return this;
    }

    get weapon(): Weapon {
        return this._weapon;
    }

    /**
     * if player is active, face the current target, check for overheat and update
     * attachments
     * @param time the current game time elapsed
     * @param delta the number of elapsed milliseconds since last update 
     */
    update(time: number, delta: number): void {
        if (this.active) {
            if (time >= this.destroyAtTime) {
                this.death();
            } else {
                this._checkOverheatCondition(delta);
                this._engine.update(time, delta);
                this._weapon.update(time, delta);
            }
        }
    }

    get location(): Phaser.Types.Math.Vector2Like {
        return {x: this.x, y: this.y};
    }

    /**
     * the location within the viewable area
     * @returns a `Phaser.Types.Math.Vector2Like` offset for location within current 
     * viewable area. for the Player, this should always return 0,0 since the
     * camera follows the Player
     */
    get locationInView(): Phaser.Types.Math.Vector2Like {
        return Helpers.convertLocToLocInView(this.location, this.scene);
    }

    get heading(): Phaser.Math.Vector2 {
        return Helpers.getHeading(this.rotationContainer.angle);
    }

    lookAt(target: Phaser.Types.Math.Vector2Like): void {
        if (target) {
            const radians: number = Phaser.Math.Angle.Between(target.x, target.y, this.x, this.y);
            const degrees: number = Phaser.Math.RadToDeg(radians);
            this.rotationContainer.setAngle(degrees);
        }
    }

    addHeat(degrees: number): void {
        this._temperature += degrees;
    }

    subtractHeat(degrees: number): void {
        this._temperature -= degrees;
        if (this._temperature < 0) {
            this._temperature = 0;
        }
    }

    /**
     * determines if the current `temperature` is over the maximum safe value
     * @returns `true` if the current `temperature` is over the maximum safe value; otherwise `false`
     */
    get isOverheating(): boolean {
        return this._temperature > SpaceSim.Constants.Ships.MAX_SAFE_TEMPERATURE;
    }

    subtractFuel(amount: number): void {
        this._remainingFuel -= amount;
        if (this._remainingFuel < 0) {
            this._remainingFuel = 0;
        }
    }

    addFuel(amount: number): void {
        this._remainingFuel += amount;
        if (this._remainingFuel > SpaceSim.Constants.Ships.MAX_FUEL) {
            this._remainingFuel = SpaceSim.Constants.Ships.MAX_FUEL;
        }
    }

    subtractIntegrity(amount: number, damageOpts?: DamageMetadata): void {
        this._updateLastDamagedBy(damageOpts);
        this._integrity -= amount;
        if (this.integrity <= 0) {
            this._integrity = 0;
            this.death(); // we are dead
        }
    }

    addIntegrity(amount: number): void {
        this._integrity += amount;
        if (this.integrity > SpaceSim.Constants.Ships.MAX_INTEGRITY) {
            this._integrity = SpaceSim.Constants.Ships.MAX_INTEGRITY;
        }
    }

    /**
     * start a 3 second countdown to ship destruction
     * 
     * NOTE: only runs when `update(time, delta)` function is called
     */
    selfDestruct(countdownSeconds: number = 3): void {
        this.destroyAtTime = this.scene.game.getTime() + (countdownSeconds * 1000);
    }

    /**
     * cancels the self destruct timer
     */
    cancelSelfDestruct(): void {
        this.destroyAtTime = undefined;
    }

    /**
     * removes this ship the physics simulation
     * @param emit a boolean indicating if a `SHIP_DEATH` event should be emitted
     * to the scene
     * @default true
     */
    death(emit: boolean = true): void {
        if (this.active) {
            if (emit) {
                this.scene.events.emit(SpaceSim.Constants.Events.SHIP_DEATH, this.currentState);
            }

            TryCatch.run(() => {
                this.destroy();
            }, 'warn', 'error destroying ship game object', 'message');
        }
    }

    /**
     * checks for and applies damage based on degrees over safe temperature at a rate
     * of {delta} milliseconds between each check.
     * also applies cooling at a rate of {SpaceSim.Constants.COOLING_RATE}
     * @param delta the number of elapsed milliseconds since last update
     */
    private _checkOverheatCondition(delta: number): void {
        if (this.active) {
            if (this.isOverheating) {
                if (this._temperature > SpaceSim.Constants.Ships.MAX_TEMPERATURE) {
                    this.death(); // we are dead
                    return;
                } else {
                    // reduce integrity at a fixed rate of 1 per second
                    let damage: number = 1 * (delta / 1000);
                    this.subtractIntegrity(damage, {
                        timestamp: this.scene.time.now,
                        message: 'ship overheat damage'
                    });
                }
            }

            let amountCooled: number = SpaceSim.Constants.Ships.COOLING_RATE_PER_SECOND * (delta / 1000);
            this.subtractHeat(amountCooled);
        }
    }

    private _createGameObj(options: ShipOptions): void {
        this.scene.add.existing(this);
        const radius = SpaceSim.Constants.Ships.RADIUS;
        this.setSize(radius * 2, radius * 2);

        this.scene.physics.add.existing(this);
        this.body.setCircle(radius);
        this.body.setMass(options.mass ?? SpaceSim.Constants.Ships.MASS);
        this.body.setBounce(SpaceSim.Constants.Ships.BOUNCE, SpaceSim.Constants.Ships.BOUNCE);
        this.body.setMaxSpeed(SpaceSim.Constants.Ships.MAX_SPEED);

        this._weaponsKey = options.weaponsKey ?? 1;
        this._wingsKey = options.wingsKey ?? 1;
        this._cockpitKey = options.cockpitKey ?? 1;
        this._engineKey = options.engineKey ?? 1;

        this._rotationContainer = this.scene.make.container({x: 0, y: 0});
        this.add(this._rotationContainer);
    }

    /**
     * appends to the `_lastDamagedBy` array and removes the oldest sources
     * if more than 5 sources tracked
     */
    private _updateLastDamagedBy(damageOpts: DamageMetadata): void {
        this._lastDamagedBy.push(damageOpts);
        while (this._lastDamagedBy.length > 5) {
            this._lastDamagedBy.shift();
        }
    }
}