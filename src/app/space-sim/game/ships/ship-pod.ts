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
import { ShipPodOptions } from "./ship-pod-options";
import { AttachmentLocation } from "./attachments/attachment-location";
import { ShipAttachment } from './attachments/ship-attachment';
import { DamageOptions } from './damage-options';
import { HasPhysicsBody } from '../interfaces/has-physics-body';
import { CardBody, LinearLayout } from "phaser-ui-components";

export class ShipPod implements Updatable, CanTarget, HasLocation, HasGameObject<Phaser.GameObjects.Container>, HasPhysicsBody, HasIntegrity, HasTemperature, HasFuel {
    readonly id: string; // UUID
    private _scene: Scene;
    private _target: HasLocation;
    private _integrity: number;
    private _remainingFuel: number;
    private _temperature: number; // in Celcius
    private _attachmentMgr: AttachmentManager;
    private _flareParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private _explosionParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private _shipSprite: Phaser.GameObjects.Sprite;
    private _shipContainer: Phaser.GameObjects.Container;
    private _shipGroup: Phaser.GameObjects.Group;
    private _shipIntegrityIndicator: LinearLayout;
    private _shipHeatIndicator: Phaser.GameObjects.Sprite;
    private _shipOverheatIndicator: Phaser.GameObjects.Text;
    private _lastDamagedBy: DamageOptions[];
    private _destroyedSound: Phaser.Sound.BaseSound;

    active: boolean = true;
    
    constructor(options: ShipPodOptions) {
        this.id = options?.id || Phaser.Math.RND.uuid();
        this._scene = options.scene;
        this._target = options?.target;
        this._integrity = options?.integrity || Constants.MAX_INTEGRITY;
        this._remainingFuel = options?.remainingFuel || Constants.MAX_FUEL;
        this._temperature = options?.temperature || 0;

        this._attachmentMgr = new AttachmentManager(this._scene, this);

        // create ship-pod sprite, group and container
        this._createGameObj(options);
        
        this._lastDamagedBy = [];

        this._destroyedSound = this._scene.sound.add('explosion', {volume: 0.1});
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
            this.lookAt(this._target?.getLocation());
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
            const alpha = this._temperature / Constants.MAX_SAFE_TEMPERATURE;
            this._shipHeatIndicator.setAlpha(alpha);
            
            if (this._temperature > Constants.MAX_TEMPERATURE) {
                this.destroy(); // we are dead
            }
            if (this._temperature > Constants.MAX_SAFE_TEMPERATURE) {
                if (!this._scene.tweens.getTweensOf(this._shipOverheatIndicator)?.length) {
                    this._shipOverheatIndicator.setAlpha(1);
                    this._scene.tweens.add({
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
                    timestamp: this._scene.time.now,
                    message: 'ship overheat damage'
                });
            } else {
                this._scene.tweens.killTweensOf(this._shipOverheatIndicator);
                this._shipOverheatIndicator.setAlpha(0);
            }
            let amountCooled: number = Constants.COOLING_RATE * (delta / 1000);
            this.applyCooling(amountCooled);
        }
    }

    /**
     * the location within coordinate space
     * @returns a {Phaser.Math.Vector2} for the location of this
     * {ShipPod} in coordinate space. this is different from the
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
        return Helpers.convertLocToLocInView(this.getLocation(), this._scene);
    }

    getGameObject(): Phaser.GameObjects.Container {
        return this._shipContainer;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return this._shipContainer?.body as Phaser.Physics.Arcade.Body;
    }

    setTarget<T extends HasLocation>(target: T): void {
        this._target = target;
    }

    getTarget<T extends HasLocation>(): T {
        return this._target as T;
    }

    lookAt(location: Phaser.Math.Vector2): void {
        if (this.getGameObject()) {
            if (location) {
                let shipPos = this.getLocation();
                let radians: number = Phaser.Math.Angle.Between(location.x, location.y, shipPos.x, shipPos.y);
                let degrees: number = Phaser.Math.RadToDeg(radians);
                this.setRotation(degrees);
            }
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

    getTemperature(): number {
        return this._temperature;
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

    reduceFuel(amount: number): void {
        this._remainingFuel -= amount;
        if (this._remainingFuel < 0) {
            this._remainingFuel = 0;
        }
    }

    addFuel(amount: number): void {
        this._remainingFuel += amount;
        if (this._remainingFuel > Constants.MAX_FUEL) {
            this._remainingFuel = Constants.MAX_FUEL;
        }
    }

    getRemainingFuel(): number {
        return this._remainingFuel;
    }

    getIntegrity(): number {
        return this._integrity;
    }

    sustainDamage(damageOpts: DamageOptions): void {
        this._updateLastDamagedBy(damageOpts);
        this._integrity -= damageOpts.amount;
        if (this._integrity <= 0) {
            this._integrity = 0;
            this.destroy(); // we are dead
            return;
        }

        // keep the health bar visible by killing any active fade out tweens
        this._scene.tweens.killTweensOf(this._shipIntegrityIndicator);

        this._updateIntegrityIndicator();
        this._shipIntegrityIndicator.setAlpha(1); // make visible
        this._scene.tweens.add({ // fade out after 5 seconds
            targets: [this._shipIntegrityIndicator],
            alpha: 0,
            yoyo: false,
            loop: 0,
            delay: 5000,
            duration: 1000
        });

        this._scene.tweens.add({
            targets: this._shipGroup.getChildren(),
            alpha: 0.5,
            yoyo: true,
            loop: 4,
            duration: 100,
            onComplete: () => {
                Phaser.Actions.SetAlpha(this._shipGroup.getChildren(), 1);
            }
        });
    }

    repair(amount: number): void {
        this._integrity = amount;
        if (this._integrity > Constants.MAX_INTEGRITY) {
            this._integrity = Constants.MAX_INTEGRITY;
        }
    }

    destroy(): void {
        this._destroyedSound.play();
        this.active = false;
        this._displayShipExplosion();
        this.getGameObject()?.setActive(false);
        this._attachmentMgr.active = false;
        this._attachmentMgr.getAttachments().forEach((attachment: ShipAttachment) => {
            if (attachment) {
                attachment.active = false;
                attachment.getGameObject()?.destroy();
            }
        });
        this.getGameObject()?.destroy();
        this._shipContainer = null;

        this._scene.events.emit(Constants.EVENT_PLAYER_DEATH, this);
    }

    private _createGameObj(config?: ShipPodOptions): void {
        // create container as parent to all ship parts
        let loc: Phaser.Math.Vector2 = config?.location ?? Helpers.vector2();
        this._shipContainer = this._scene.add.container(loc.x, loc.y);
        this._shipContainer.setDepth(Constants.DEPTH_PLAYER);

        // create particle systems for destruction
        this._flareParticles = this._scene.add.particles('flares');
        this._flareParticles.setDepth(Constants.DEPTH_PLAYER);
        this._explosionParticles = this._scene.add.particles('explosion');
        this._explosionParticles.setDepth(Constants.DEPTH_PLAYER);

        // create ship sprite and set container bounds based on sprite size
        this._shipSprite = this._scene.add.sprite(0, 0, 'ship-pod');
        this._shipContainer.add(this._shipSprite);
        this._shipContainer.add(this._attachmentMgr);
        const containerBounds: Phaser.Geom.Rectangle = this._shipContainer.getBounds();
        this._shipContainer.setSize(containerBounds.width, containerBounds.height);

        // setup physics for container
        this._scene.physics.add.existing(this._shipContainer);
        this.getPhysicsBody().setBounce(0.2, 0.2);
        this.getPhysicsBody().setMaxVelocity(Constants.MAX_VELOCITY, Constants.MAX_VELOCITY);

        this._shipGroup = this._scene.add.group([this._shipSprite, this._attachmentMgr]);

        this._createIntegrityIndicator();

        this._createHeatIndicator();

        this._createOverheatIndicator();
    }

    private _createIntegrityIndicator(): void {
        this._shipIntegrityIndicator = new CardBody(this._scene, {
            y: -30,
            orientation: 'horizontal',
            padding: 1,
            desiredWidth: 102,
            alignment: {horizontal: 'left'},
            background: {fillStyle: {color: 0xffffff}}
        });
        this._shipIntegrityIndicator.setAlpha(0); // only visible when damage sustained
        this._shipContainer.add(this._shipIntegrityIndicator);
        
        this._shipContainer.add(this._shipIntegrityIndicator);
    }

    private _createHeatIndicator(): void {
        this._shipHeatIndicator = this._scene.add.sprite(0, 0, 'overheat-glow');
        this._shipHeatIndicator.setAlpha(0); // no heat
        this._shipContainer.add(this._shipHeatIndicator);
        this._shipContainer.sendToBack(this._shipHeatIndicator);
        this._scene.tweens.add({
            targets: this._shipHeatIndicator,
            scale: 1.05,
            angle: 45,
            yoyo: true,
            duration: 500,
            loop: -1
        });
    }

    private _createOverheatIndicator(): void {
        this._shipOverheatIndicator = this._scene.add.text(0, -75, 'OVERHEAT', {font: '30px Courier', color: '#ffff00', stroke: '#ff0000', strokeThickness: 4});
        this._shipOverheatIndicator.setAlpha(0);
        this._shipOverheatIndicator.setX(-this._shipOverheatIndicator.width / 2);
        this._shipContainer.add(this._shipOverheatIndicator);
    }

    private _updateIntegrityIndicator(): void {
        if (this._shipIntegrityIndicator) {
            this._shipIntegrityIndicator.removeAllContent(true);

            let square: Phaser.GameObjects.Graphics = this._scene.add.graphics({fillStyle: {color: 0xff6060}});
            square.fillRect(-Math.floor(this._integrity/2), -2, this._integrity, 4);
            let squareContainer: Phaser.GameObjects.Container = this._scene.add.container(0, 0, [square]);
            squareContainer.setSize(4, 4);
            this._shipIntegrityIndicator.addContents(squareContainer);
        }
    }

    private _displayShipExplosion(): void {
        let pos: Phaser.Math.Vector2 = this.getLocation();
        this._explosionParticles.createEmitter({
            x: pos.x,
            y: pos.y,
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
        this._flareParticles.createEmitter({
            frame: Constants.Flare.red as number,
            x: pos.x,
            y: pos.y,
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