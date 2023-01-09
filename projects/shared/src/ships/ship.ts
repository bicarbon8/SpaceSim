import { Scene } from "phaser";
import { LayoutContainer } from "phaser-ui-components";
import { Constants } from "../utilities/constants";
import { Helpers } from "../utilities/helpers";
import { Engine } from "./attachments/utility/engine";
import { DamageOptions } from './damage-options';
import { HasPhysicsBody } from '../interfaces/has-physics-body';
import { Weapons } from "./attachments/offence/weapons";
import { MachineGun } from "./attachments/offence/machine-gun";
import { ShipLike } from "../interfaces/ship-like";
import { IsConfigurable } from "../interfaces/is-configurable";
import { Animations } from "../../../client/src/app/space-sim/game/utilities/animations";
import { PhysicsObject } from "../interfaces/physics-object";

export type ShipOptions = Partial<PhysicsObject> & {
    readonly id?: string;
    readonly name?: string;
    readonly fingerprint?: string;
    readonly integrity?: number;
    readonly remainingFuel?: number;
    readonly remainingAmmo?: number;
    readonly temperature?: number;
    readonly mass?: number;
    readonly weaponsKey?: number;
    readonly wingsKey?: number;
    readonly cockpitKey?: number;
    readonly engineKey?: number;
}

export class Ship implements ShipOptions, ShipLike, HasPhysicsBody, IsConfigurable<ShipOptions> {
    /** ShipOptions */
    readonly id: string; // UUID
    readonly scene: Scene;
    readonly mass: number;
    readonly fingerprint: string;
    readonly name: string;
    
    private _active: boolean = true;
    private _temperature: number; // in Celcius
    private _integrity: number;
    private _remainingFuel: number;
    private _weaponsKey: number;
    private _wingsKey: number;
    private _cockpitKey: number;
    private _engineKey: number;

    private _engine: Engine;
    private _weapons: Weapons;

    private _positionContainer: Phaser.GameObjects.Container; // used for position and physics
    private _rotationContainer: Phaser.GameObjects.Container; // used for rotation
    private _lastDamagedBy: DamageOptions[];
    private _minimapSprite: Phaser.GameObjects.Sprite;

    private _selfDestruct: boolean;
    
    constructor(scene: Phaser.Scene, options: ShipOptions) {
        this.id = options.id ?? Phaser.Math.RND.uuid();
        this.scene = scene;
        this.mass = options.mass ?? 100;
        this.name = options.name;
        this.fingerprint = options.fingerprint;

        // create ship-pod sprite, group and container
        this._createGameObj(options);
        
        this._lastDamagedBy = [];

        this.configure(options);
    }

    configure(options: ShipOptions): this {
        if (this.active) {
            const loc = options.location ?? Helpers.vector2();
            this.setLocation(loc);
            const v = options.velocity ?? Helpers.vector2();
            this.getPhysicsBody().setVelocity(v.x, v.y);
            const angle = options.angle ?? 0;
            this.setRotation(angle);
            this._integrity = options.integrity ?? Constants.Ship.MAX_INTEGRITY;
            this._remainingFuel = options.remainingFuel ?? Constants.Ship.MAX_FUEL;
            this.getWeapons().remainingAmmo = options.remainingAmmo ?? Constants.Ship.Weapons.MAX_AMMO;
            this._temperature = options.temperature ?? 0;
        }
        return this;
    }

    get config(): ShipOptions {
        return {
            id: this.id,
            location: {x: this.location.x, y: this.location.y},
            velocity: {x: this.velocity.x, y: this.velocity.y},
            angle: this.angle,
            angularVelocity: 0,
            integrity: this.integrity,
            remainingFuel: this.remainingFuel,
            remainingAmmo: this.getWeapons().remainingAmmo,
            temperature: this.temperature,
            mass: this.mass,
            name: this.name,
            weaponsKey: this.weaponsKey,
            wingsKey: this.wingsKey,
            cockpitKey: this.cockpitKey,
            engineKey: this.engineKey
        };
    }

    get active(): boolean {
        return this._active && this.getGameObject()?.active && this.getPhysicsBody()?.enable;
    }

    get positionContainer(): Phaser.GameObjects.Container {
        return this._positionContainer;
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

    get location(): Phaser.Math.Vector2 {
        let go: Phaser.GameObjects.Container = this._positionContainer;
        if (go) {
            return new Phaser.Math.Vector2(go.x, go.y);
        }
        return Phaser.Math.Vector2.ZERO;
    }

    get velocity(): Phaser.Math.Vector2 {
        return this.getPhysicsBody()?.velocity ?? Helpers.vector2();
    }

    get angle(): number {
        return this._rotationContainer?.angle || 0;
    }

    get integrity(): number {
        return this._integrity;
    }

    get remainingFuel(): number {
        return this._remainingFuel;
    }

    get temperature(): number {
        return this._temperature;
    }

    get damageSources(): Array<DamageOptions> {
        return this._lastDamagedBy
            .map(d => {
                return {...d} as DamageOptions;
            });
    }
    
    getWeapons(): Weapons {
        return this._weapons;
    }

    getThruster(): Engine {
        return this._engine;
    }

    get minimapSprite(): Phaser.GameObjects.Sprite {
        return this._minimapSprite;
    }

    /**
     * if player is active, face the current target, check for overheat and update
     * attachments
     * @param time the current game time elapsed
     * @param delta the number of elapsed milliseconds since last update 
     */
    update(time: number, delta: number): void {
        if (this.active) {
            this._checkOverheatCondition(time, delta);
            this._engine.update(time, delta);
            this._weapons.update(time, delta);

            const pos = this.getLocation();
        }
    }

    /**
     * checks for and applies damage based on degrees over safe temperature at a rate
     * of {delta} milliseconds between each check.
     * also applies cooling at a rate of {Constants.COOLING_RATE}
     * @param time the current game time elapsed
     * @param delta the number of elapsed milliseconds since last update
     */
    private _checkOverheatCondition(time: number, delta: number): void {
        if (this.active) {
            if (this.isOverheating()) {
                if (this._temperature > Constants.Ship.MAX_TEMPERATURE) {
                    this.destroy(); // we are dead
                    return;
                } else {
                    // reduce integrity at a fixed rate of 1 per second
                    let damage: number = 1 * (delta / 1000);
                    this.sustainDamage({
                        amount: damage, 
                        timestamp: this.scene.time.now,
                        message: 'ship overheat damage'
                    });
                }
            }

            let amountCooled: number = Constants.Ship.COOLING_RATE_PER_SECOND * (delta / 1000);
            this.applyCooling(amountCooled);
        }
    }

    /**
     * the location within coordinate space
     * @returns a {Phaser.Math.Vector2} for the location of this
     * {Ship} in coordinate space. this is different from the
     * location on screen
     */
    getLocation(): Phaser.Math.Vector2 {
        let go: Phaser.GameObjects.Container = this._positionContainer;
        if (go) {
            return new Phaser.Math.Vector2(go.x, go.y);
        }
        return Phaser.Math.Vector2.ZERO;
    }

    setLocation(location: Phaser.Types.Math.Vector2Like): void {
        let go: Phaser.GameObjects.Container = this._positionContainer;
        go.x = location.x;
        go.y = location.y;
    }

    /**
     * the location within the viewable area
     * @returns a `Phaser.Math.Vector2` offset for location within current 
     * viewable area. for the Player, this should always return 0,0 since the
     * camera follows the Player
     */
    getLocationInView(): Phaser.Math.Vector2 {
        return Helpers.convertLocToLocInView(this.getLocation(), this.scene);
    }

    setLocationInView(location: Phaser.Types.Math.Vector2Like): void {
        const loc = Helpers.convertLocInViewToLoc(location, this.scene);
        this.setLocation(loc);
    }

    getGameObject(): Phaser.GameObjects.Container {
        return this._positionContainer;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return this._positionContainer?.body as Phaser.Physics.Arcade.Body;
    }

    getRotationContainer(): Phaser.GameObjects.Container {
        return this._rotationContainer;
    }

    lookAt(target: Phaser.Types.Math.Vector2Like): void {
        if (target && this.getGameObject()) {
            const shipPos = this.getLocation();
            const radians: number = Phaser.Math.Angle.Between(target.x, target.y, shipPos.x, shipPos.y);
            const degrees: number = Phaser.Math.RadToDeg(radians);
            this.setRotation(degrees);
        }
    }

    /**
     * the rotation of the Ship's {GameObject.body} in degrees
     */
    getRotation(): number {
        return this._rotationContainer?.angle || 0;
    }

    /**
     * sets the ship's angle in degrees
     * @param angle the angle in degrees
     */
    setRotation(angle: number): void {
        this._rotationContainer.setAngle(angle);
    }

    getHeading(): Phaser.Math.Vector2 {
        return Helpers.getHeading(this.getRotation());
    }

    getSpeed(): number {
        return this.getVelocity().length();
    }

    getVelocity(): Phaser.Math.Vector2 {
        return this.getPhysicsBody()?.velocity ?? Helpers.vector2();
    }

    applyHeating(degrees: number): void {
        this._temperature += degrees;
    }

    applyCooling(degrees: number): void {
        this._temperature -= degrees;
        if (this._temperature < 0) {
            this._temperature = 0;
        }
    }

    /**
     * determines if the current `temperature` is over the maximum safe value
     * @returns `true` if the current `temperature` is over the maximum safe value; otherwise `false`
     */
    isOverheating(): boolean {
        return this._temperature > Constants.Ship.MAX_SAFE_TEMPERATURE;
    }

    reduceFuel(amount: number): void {
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

    getRemainingFuel(): number {
        return this._remainingFuel;
    }

    getIntegrity(): number {
        return this.integrity;
    }

    sustainDamage(damageOpts: DamageOptions): void {
        this._updateLastDamagedBy(damageOpts);
        this._integrity -= damageOpts.amount;
        if (this.integrity <= 0) {
            this._integrity = 0;
            this.destroy(); // we are dead
            return;
        }
    }

    repair(amount: number): void {
        this._integrity += amount;
        if (this.integrity > Constants.Ship.MAX_INTEGRITY) {
            this._integrity = Constants.Ship.MAX_INTEGRITY;
        }
    }

    /**
     * start a 3 second countdown to ship destruction
     */
    selfDestruct(): void {
        this._selfDestruct = true;
        const text = this.scene.make.text({
            x: 0, 
            y: -75, 
            text: '3', 
            style: {font: '30px Courier', color: '#ffff00', stroke: '#ff0000', strokeThickness: 4}
        });
        text.setX(-text.width / 2);
        this._positionContainer.add(text);
        const onComplete = () => {
            if (this._selfDestruct) {
                let countdownTxt: number = +text.text;
                countdownTxt--;
                if (countdownTxt <= 0) {
                    this.destroy();
                } else {
                    text.setText(`${countdownTxt}`);
                    text.setAlpha(1);
                    Animations.fadeOut(text, 1000, onComplete);
                }
            }
        }
        Animations.fadeOut(text, 1000, onComplete);
    }

    cancelSelfDestruct(): void {
        this._selfDestruct = false;
    }

    destroy(emit: boolean = true): void {
        if (emit) {
            this.scene.events.emit(Constants.Events.PLAYER_DEATH, this.config);
        }

        this._active = false;
        Helpers.trycatch(() => {
            this.getGameObject()?.setActive(false);
            this.getGameObject()?.destroy();
        }, 'warn', 'error destroying ship game object', 'message');
        this._positionContainer = null;
    }

    private _createGameObj(options?: ShipOptions): void {
        // create container as parent to all ship parts
        let loc = options?.location ?? Helpers.vector2();
        this._positionContainer = this.scene.add.container(loc.x, loc.y);
        
        this._rotationContainer = this.scene.add.container(0, 0);
        this._positionContainer.add(this._rotationContainer);
        
        const containerBounds: Phaser.Geom.Rectangle = this._positionContainer.getBounds();
        this._positionContainer.setSize(containerBounds.width, containerBounds.height);

        // setup physics for container
        this.scene.physics.add.existing(this._positionContainer);

        this.getPhysicsBody().setCircle(Constants.Ship.RADIUS);
        this.getPhysicsBody().setMass(this.mass);
        this.getPhysicsBody().setBounce(0.2, 0.2);
        this.getPhysicsBody().setMaxSpeed(Constants.Ship.MAX_SPEED);

        this._weaponsKey = options.weaponsKey ?? 1;
        this._wingsKey = options.wingsKey ?? 1;
        this._cockpitKey = options.cockpitKey ?? 1;
        this._engineKey = options.engineKey ?? 1;

        this._engine = new Engine(this);
        this._weapons = new MachineGun(this);
    }

    private _updateLastDamagedBy(damageOpts: DamageOptions): void {
        this._lastDamagedBy.push(damageOpts);
        if (this._lastDamagedBy.length > 5) {
            this._lastDamagedBy.shift();
        }
    }
}