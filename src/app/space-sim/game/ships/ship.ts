import { Scene } from "phaser";
import { Updatable } from "../interfaces/updatable";
import { CanTarget } from "../interfaces/can-target";
import { HasLocation } from "../interfaces/has-location";
import { HasGameObject } from "../interfaces/has-game-object";
import { HasIntegrity } from "../interfaces/has-integrity";
import { Constants } from "../utilities/constants";
import { Helpers } from "../utilities/helpers";
import { HasTemperature } from "../interfaces/has-temperature";
import { HasFuel } from "../interfaces/has-fuel";
import { AttachmentManager } from "./attachments/attachment-manager";
import { ThrusterAttachment } from "./attachments/utility/thruster-attachment";
import { ShipOptions } from "./ship-options";
import { AttachmentLocation } from "./attachments/attachment-location";
import { DamageOptions } from './damage-options';
import { HasPhysicsBody } from '../interfaces/has-physics-body';
import { LayoutContainer } from "phaser-ui-components";
import { OffenceAttachment } from "./attachments/offence/offence-attachment";
import { FuelSupply } from "./supplies/fuel-supply";
import { SpaceSim } from "../space-sim";
import { AmmoSupply } from "./supplies/ammo-supply";
import { CoolantSupply } from "./supplies/coolant-supply";

export class Ship implements ShipOptions, Updatable, CanTarget, HasLocation, HasGameObject<Phaser.GameObjects.Container>, HasPhysicsBody, HasIntegrity, HasTemperature, HasFuel {
    /** ShipOptions */
    readonly id: string; // UUID
    readonly scene: Scene;
    readonly mass: number;
    target: HasLocation;
    private _temperature: number; // in Celcius
    private _integrity: number;
    private _remainingFuel: number;

    private _attachmentMgr: AttachmentManager;
    private _shipSprite: Phaser.GameObjects.Sprite;
    private _shipContainer: Phaser.GameObjects.Container;
    private _shipGroup: Phaser.GameObjects.Group;
    private _shipIntegrityIndicator: LayoutContainer;
    private _shipHeatIndicator: Phaser.GameObjects.Sprite;
    private _shipOverheatIndicator: Phaser.GameObjects.Text;
    private _lastDamagedBy: DamageOptions[];
    private _destroyedSound: Phaser.Sound.BaseSound;
    private _shipDamageFlicker: Phaser.Tweens.Tween;

    active: boolean = true;
    
    constructor(options: ShipOptions) {
        this.id = options.id ?? Phaser.Math.RND.uuid();
        this.scene = options.scene;
        this.target = options.target;
        this._integrity = options.integrity ?? Constants.Ship.MAX_INTEGRITY;
        this._remainingFuel = options.remainingFuel ?? Constants.Ship.MAX_FUEL;
        this._temperature = options.temperature ?? 0;
        this.mass = options.mass ?? 100;

        this._attachmentMgr = new AttachmentManager(this);

        // create ship-pod sprite, group and container
        this._createGameObj(options);
        
        this._lastDamagedBy = [];

        this._destroyedSound = this.scene.sound.add('explosion', {volume: 0.1});
    }

    get temperature(): number {
        return this._temperature;
    }

    get integrity(): number {
        return this._integrity;
    }

    get attachments(): AttachmentManager {
        return this._attachmentMgr;
    }

    getThruster(): ThrusterAttachment {
        return this.attachments.getAttachmentAt<ThrusterAttachment>(AttachmentLocation.back);
    }

    /**
     * if player is active, face the current target, check for overheat and update
     * attachments
     * @param time the current game time elapsed
     * @param delta the number of elapsed milliseconds since last update 
     */
    update(time: number, delta: number): void {
        if (this.active) {
            this.lookAtTarget();
            this._checkOverheatCondition(time, delta);
            this.attachments.update(time, delta);
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
            const alpha = this._temperature / Constants.Ship.MAX_SAFE_TEMPERATURE;
            this._shipHeatIndicator.setAlpha(Math.min(alpha, 1));
            
            if (this.isOverheating()) {
                if (this._temperature > Constants.Ship.MAX_TEMPERATURE) {
                    this.destroy(); // we are dead
                    return;
                } else {
                    if (!this.scene.tweens.getTweensOf(this._shipOverheatIndicator)?.length) {
                        this._shipOverheatIndicator.setAlpha(1);
                        this.scene.tweens.add({
                            targets: this._shipOverheatIndicator,
                            alpha: 0,
                            yoyo: true,
                            duration: 200,
                            loop: -1
                        });
                    }
                    // reduce integrity at a fixed rate of 1 per second
                    let damage: number = 1 * (delta / 1000);
                    this.sustainDamage({
                        amount: damage, 
                        timestamp: this.scene.time.now,
                        message: 'ship overheat damage'
                    });
                }
            } else {
                // ensure "OVERHEAT" warning is off
                this.scene.tweens.killTweensOf(this._shipOverheatIndicator);
                this._shipOverheatIndicator.setAlpha(0);
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
        let go: Phaser.GameObjects.Container = this._shipContainer;
        if (go) {
            return new Phaser.Math.Vector2(go.x, go.y);
        }
        return Phaser.Math.Vector2.ZERO;
    }

    setLocation(location: Phaser.Math.Vector2): void {
        let go: Phaser.GameObjects.Container = this._shipContainer;
        go.x = location.x;
        go.y = location.y;
    }

    /**
     * the location within the viewable area
     * @returns a {Phaser.Math.Vector2} offset for location within current 
     * viewable area. for the Player, this should always return 0,0 since the
     * camera follows the Player
     */
    getLocationInView(): Phaser.Math.Vector2 {
        return Helpers.convertLocToLocInView(this.getLocation(), this.scene);
    }

    getGameObject(): Phaser.GameObjects.Container {
        return this._shipContainer;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return this._shipContainer?.body as Phaser.Physics.Arcade.Body;
    }

    lookAtTarget(): void {
        if (this.target && this.getGameObject()) {
            const loc = this.target.getLocation();
            const shipPos = this.getLocation();
            const radians: number = Phaser.Math.Angle.Between(loc.x, loc.y, shipPos.x, shipPos.y);
            const degrees: number = Phaser.Math.RadToDeg(radians);
            this.setRotation(degrees);
        }
    }

    /**
     * the rotation of the Ship's {GameObject.body} in degrees
     */
    getRotation(): number {
        return this._shipSprite?.angle || 0;
    }

    /**
     * sets the ship's angle in degrees
     * @param angle the angle in degrees
     */
    setRotation(angle: number): void {
        Phaser.Actions.SetRotation(this._shipGroup.getChildren(), Phaser.Math.DegToRad(angle));
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

        // keep the health bar visible by killing any active fade out tweens
        this.scene.tweens.killTweensOf(this._shipIntegrityIndicator);

        this._updateIntegrityIndicator();
        this._shipIntegrityIndicator.setAlpha(1); // make visible
        this.scene.tweens.add({ // fade out after 5 seconds
            targets: [this._shipIntegrityIndicator],
            alpha: 0,
            yoyo: false,
            loop: 0,
            delay: 5000,
            duration: 1000
        });

        if (!this._shipDamageFlicker?.isPlaying()) {
            this._shipDamageFlicker = this.scene.tweens.add({
                targets: this._shipGroup.getChildren(),
                alpha: 0.5,
                yoyo: true,
                loop: 4,
                duration: 50,
                onComplete: () => {
                    Phaser.Actions.SetAlpha(this._shipGroup.getChildren(), 1);
                }
            });
        }
    }

    repair(amount: number): void {
        this._integrity = amount;
        if (this.integrity > Constants.Ship.MAX_INTEGRITY) {
            this._integrity = Constants.Ship.MAX_INTEGRITY;
        }
    }

    destroy(): void {
        this._destroyedSound.play();
        this.active = false;
        this._displayShipExplosion();
        this._expelSupplies();
        this.getGameObject()?.setActive(false);
        this._attachmentMgr.active = false;
        this._attachmentMgr.getAttachments()
            .forEach(attachment => attachment?.destroy());
        try {
            this.getGameObject()?.destroy();
        } catch (e) {
            /* ignore */
        }
        this._shipContainer = null;

        this.scene.events.emit(Constants.Events.PLAYER_DEATH, this);
    }

    private _createGameObj(config?: ShipOptions): void {
        // create container as parent to all ship parts
        let loc: Phaser.Math.Vector2 = config?.location ?? Helpers.vector2();
        this._shipContainer = this.scene.add.container(loc.x, loc.y);
        this._shipContainer.setDepth(Constants.UI.Layers.PLAYER);

        // create ship sprite and set container bounds based on sprite size
        this._shipSprite = this.scene.add.sprite(0, 0, 'ship-pod');
        this._shipContainer.add(this._shipSprite);
        this._shipContainer.add(this._attachmentMgr.getGameObject());
        const containerBounds: Phaser.Geom.Rectangle = this._shipContainer.getBounds();
        this._shipContainer.setSize(containerBounds.width, containerBounds.height);

        // setup physics for container
        this.scene.physics.add.existing(this._shipContainer);

        this.getPhysicsBody().setCircle(16);
        this.getPhysicsBody().setMass(this.mass);
        this.getPhysicsBody().setBounce(0.2, 0.2);
        this.getPhysicsBody().setMaxSpeed(Constants.Ship.MAX_SPEED);

        this._shipGroup = this.scene.add.group([this._shipSprite, this._attachmentMgr.getGameObject()]);

        this._createIntegrityIndicator();

        this._createHeatIndicator();

        this._createOverheatIndicator();
    }

    private _createIntegrityIndicator(): void {
        this._shipIntegrityIndicator = new LayoutContainer(this.scene, {
            y: -30,
            padding: 1,
            desiredWidth: 102,
            desiredHeight: 6,
            alignment: {horizontal: 'left'},
            background: {fillStyle: {color: 0xffffff}}
        });
        this._shipIntegrityIndicator.setAlpha(0); // only visible when damage sustained
        this._shipContainer.add(this._shipIntegrityIndicator);
        
        this._shipContainer.add(this._shipIntegrityIndicator);
    }

    private _createHeatIndicator(): void {
        this._shipHeatIndicator = this.scene.add.sprite(0, 0, 'overheat-glow');
        this._shipHeatIndicator.setAlpha(0); // no heat
        this._shipContainer.add(this._shipHeatIndicator);
        this._shipContainer.sendToBack(this._shipHeatIndicator);
        this.scene.tweens.add({
            targets: this._shipHeatIndicator,
            scale: 1.05,
            angle: 45,
            yoyo: true,
            duration: 500,
            loop: -1
        });
    }

    private _createOverheatIndicator(): void {
        this._shipOverheatIndicator = this.scene.add.text(0, -75, 'OVERHEAT', {font: '30px Courier', color: '#ffff00', stroke: '#ff0000', strokeThickness: 4});
        this._shipOverheatIndicator.setAlpha(0);
        this._shipOverheatIndicator.setX(-this._shipOverheatIndicator.width / 2);
        this._shipContainer.add(this._shipOverheatIndicator);
    }

    private _updateIntegrityIndicator(): void {
        if (this._shipIntegrityIndicator) {
            this._shipIntegrityIndicator.removeContent(true);

            let square: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: {color: 0xff6060}});
            square.fillRect(-Math.floor(this.integrity/2), -2, this.integrity, 4);
            let squareContainer: Phaser.GameObjects.Container = this.scene.add.container(0, 0, [square]);
            squareContainer.setSize(this.integrity, 4);
            this._shipIntegrityIndicator.setContent(squareContainer);
        }
    }

    private _expelSupplies(): void {
        const loc = this.getLocation();
        let remainingFuel = this._remainingFuel / 2;
        const fuelContainersCount = Phaser.Math.RND.between(1, remainingFuel / Constants.Ship.MAX_FUEL_PER_CONTAINER);
        for (var i=0; i<fuelContainersCount; i++) {
            const amount = (remainingFuel > Constants.Ship.MAX_FUEL_PER_CONTAINER) 
                ? Constants.Ship.MAX_FUEL_PER_CONTAINER 
                : remainingFuel;
            remainingFuel -= amount;
            new FuelSupply(this.scene, {
                amount: amount,
                location: loc
            });
        }
        let remainingAmmo = (this.attachments.getAttachmentAt(AttachmentLocation.front) as OffenceAttachment)?.ammo / 2;
        const ammoContainersCount = Phaser.Math.RND.between(1, remainingAmmo / Constants.Ship.Attachments.Offence.MAX_AMMO_PER_CONTAINER);
        for (var i=0; i<ammoContainersCount; i++) {
            const amount = (remainingAmmo > Constants.Ship.Attachments.Offence.MAX_AMMO_PER_CONTAINER) 
                ? Constants.Ship.Attachments.Offence.MAX_AMMO_PER_CONTAINER 
                : remainingAmmo;
            remainingAmmo -= amount;
            new AmmoSupply(this.scene, {
                amount: amount,
                location: loc
            });
        }
        if (Phaser.Math.RND.between(0, 1)) {
            new CoolantSupply(this.scene, {
                amount: 40,
                location: loc
            });
        }
    }

    private _displayShipExplosion(): void {
        // create particle systems for destruction
        let pos: Phaser.Math.Vector2 = this.getLocation();
        const flare = this.scene.add.particles('flares');
        flare.setPosition(pos.x, pos.y);
        flare.setDepth(Constants.UI.Layers.PLAYER);
        const explosion = this.scene.add.particles('explosion');
        explosion.setPosition(pos.x, pos.y);
        explosion.setDepth(Constants.UI.Layers.PLAYER);

        const explosionEmitter = explosion.createEmitter({
            lifespan: { min: 500, max: 1000 },
            speedX: { min: -1, max: 1 },
            speedY: { min: -1, max: 1 },
            angle: { min: -180, max: 179 },
            gravityX: 0,
            gravityY: 0,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            maxParticles: 3
        });
        const flareEmitter = flare.createEmitter({
            frame: Constants.UI.SpriteMaps.Flares.red as number,
            lifespan: { min: 100, max: 500 },
            speedX: { min: -600, max: 600 },
            speedY: { min: -600, max: 600 },
            angle: { min: -180, max: 179 },
            gravityX: 0,
            gravityY: 0,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            maxParticles: 10
        });
    }

    private _updateLastDamagedBy(damageOpts: DamageOptions): void {
        this._lastDamagedBy.push(damageOpts);
        if (this._lastDamagedBy.length > 5) {
            this._lastDamagedBy.shift();
        }
    }
}