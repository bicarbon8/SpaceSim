import * as Phaser from "phaser";
import { Constants } from "../utilities/constants";
import { Helpers } from "../utilities/helpers";
import { Engine } from "./attachments/utility/engine";
import { DamageMetadata } from '../interfaces/damage-metadata';
import { Weapon } from "./attachments/offence/weapon";
import { IsConfigurable } from "../interfaces/is-configurable";
import { PhysicsObject } from "../interfaces/physics-object";
import { BaseScene } from "../scenes/base-scene";
import { HasId } from "../interfaces/has-id";
import { HasLocation } from "../interfaces/has-location";

export type ShipConfig = PhysicsObject & {
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
};

export type ShipOptions = Partial<ShipConfig> & {
    fingerprint?: string;
    engine: Engine | (new (scene: BaseScene) => Engine);
    weapon: Weapon | (new (scene: BaseScene) => Weapon);
};

export class Ship extends Phaser.GameObjects.Container implements HasId, HasLocation, IsConfigurable<ShipConfig> {
    /** ShipOptions */
    readonly id: string; // UUID
    readonly fingerprint: string;
    readonly name: string;
    
    private readonly _lastDamagedBy: Array<DamageMetadata>;
    
    private _temperature: number; // in Celcius
    private _integrity: number;
    private _remainingFuel: number;
    private _weaponsKey: number;
    private _wingsKey: number;
    private _cockpitKey: number;
    private _engineKey: number;

    private _engine: Engine;
    private _weapon: Weapon;

    private _rotationContainer: Phaser.GameObjects.Container; // used for rotation
    
    
    private _destroyAtTime: number;

    // override property types
    public scene: BaseScene
    public body: Phaser.Physics.Arcade.Body;
    
    constructor(scene: BaseScene, options: ShipOptions) {
        super(scene, options.location?.x, options.location?.y);
        this.id = options.id ?? Phaser.Math.RND.uuid();
        this.name = options.name;
        this.fingerprint = options.fingerprint;

        this._lastDamagedBy = new Array<DamageMetadata>();

        // create ship-pod sprite, group and container
        this._createGameObj(options);

        this.setEngine(options.engine);
        this.setWeapon(options.weapon);
        
        this.configure(options);
    }

    configure(options: Partial<ShipConfig>): this {
        if (this.active) {
            const loc = options.location ?? Helpers.vector2();
            this.setPosition(loc.x, loc.y);
            const v = options.velocity ?? Helpers.vector2();
            this.body.setVelocity(v.x, v.y);
            const angle = options.angle ?? 0;
            this.rotationContainer.setAngle(angle);
            this._integrity = options.integrity ?? Constants.Ship.MAX_INTEGRITY;
            this._remainingFuel = options.remainingFuel ?? Constants.Ship.MAX_FUEL;
            this.weapon.remainingAmmo = options.remainingAmmo ?? Constants.Ship.Weapons.MAX_AMMO;
            this._temperature = options.temperature ?? 0;
        }
        return this;
    }

    get config(): ShipConfig {
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
            engineKey: this.engineKey
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

    /**
     * returns the time in milliseconds that we should
     * destroy this ship
     */
    get destroyAt(): number {
        return this._destroyAtTime;
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
            if (time >= this.destroyAt) {
                this.death();
            } else {
                this._checkOverheatCondition(delta);
                this._engine.update(time, delta);
                this._weapon.update(time, delta);
            }
        }
    }

    /**
     * checks for and applies damage based on degrees over safe temperature at a rate
     * of {delta} milliseconds between each check.
     * also applies cooling at a rate of {Constants.COOLING_RATE}
     * @param delta the number of elapsed milliseconds since last update
     */
    private _checkOverheatCondition(delta: number): void {
        if (this.active) {
            if (this.isOverheating) {
                if (this._temperature > Constants.Ship.MAX_TEMPERATURE) {
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

            let amountCooled: number = Constants.Ship.COOLING_RATE_PER_SECOND * (delta / 1000);
            this.subtractHeat(amountCooled);
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
        return this._temperature > Constants.Ship.MAX_SAFE_TEMPERATURE;
    }

    subtractFuel(amount: number): void {
        this._remainingFuel -= amount;
        if (this._remainingFuel < 0) {
            this._remainingFuel = 0;
        }
    }

    addFuel(amount: number): void {
        this._remainingFuel += amount;
        if (this._remainingFuel > Constants.Ship.MAX_FUEL) {
            this._remainingFuel = Constants.Ship.MAX_FUEL;
        }
    }

    subtractIntegrity(amount: number, damageOpts?: DamageMetadata): void {
        this._updateLastDamagedBy(damageOpts);
        this._integrity -= amount;
        if (this.integrity <= 0) {
            this._integrity = 0;
            this.death(); // we are dead
            return;
        }
    }

    addIntegrity(amount: number): void {
        this._integrity += amount;
        if (this.integrity > Constants.Ship.MAX_INTEGRITY) {
            this._integrity = Constants.Ship.MAX_INTEGRITY;
        }
    }

    /**
     * start a 3 second countdown to ship destruction
     * 
     * NOTE: only runs when `update(time, delta)` function is called
     */
    selfDestruct(countdownSeconds: number = 3): void {
        this._destroyAtTime = this.scene.game.getTime() + (countdownSeconds * 1000);
    }

    /**
     * cancels the self destruct timer
     */
    cancelSelfDestruct(): void {
        this._destroyAtTime = undefined;
    }

    /**
     * removes this ship the physics simulation
     * @param emit a boolean indicating if a `PLAYER_DEATH` event should be emitted
     * to the scene
     * @default true
     */
    death(emit: boolean = true): void {
        if (this.active) {
            if (emit) {
                this.scene.events.emit(Constants.Events.PLAYER_DEATH, this.config);
            }

            Helpers.trycatch(() => {
                this.destroy();
            }, 'warn', 'error destroying ship game object', 'message');
        }
    }

    private _createGameObj(options: ShipOptions): void {
        this.scene.add.existing(this);
        const radius = Constants.Ship.RADIUS;
        this.setSize(radius * 2, radius * 2);

        this.scene.physics.add.existing(this);
        this.body.setCircle(radius);
        this.body.setMass(options.mass ?? 100);
        this.body.setBounce(0.2, 0.2);
        this.body.setMaxSpeed(Constants.Ship.MAX_SPEED);

        this._weaponsKey = options.weaponsKey ?? 1;
        this._wingsKey = options.wingsKey ?? 1;
        this._cockpitKey = options.cockpitKey ?? 1;
        this._engineKey = options.engineKey ?? 1;

        this._rotationContainer = this.scene.add.container(0, 0);
        this.add(this._rotationContainer);
    }

    /**
     * appends to the `_lastDamagedBy` array and removes the oldest sources
     * if more than 5 sources tracked
     */
    private _updateLastDamagedBy(damageOpts: DamageMetadata): void {
        this._lastDamagedBy.push(damageOpts);
        if (this._lastDamagedBy.length > 5) {
            this._lastDamagedBy.shift();
        }
    }
}