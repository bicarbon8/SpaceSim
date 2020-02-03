import "phaser";
import { RNG } from "../utilities/rng";
import { Updatable } from "../interfaces/updatable";
import { CanTarget } from "../interfaces/can-target";
import { CanThrust } from "../interfaces/can-thrust";
import { HasLocation } from "../interfaces/has-location";
import { HasGameObject } from "../interfaces/has-game-object";
import { Globals } from "../utilities/globals";
import { HasIntegrity } from "../interfaces/has-integrity";
import { Constants } from "../utilities/constants";
import { ShipAttachment } from "./attachments/ship-attachment";
import { HasAttachments } from "../interfaces/has-attachments";
import { Helpers } from "../utilities/helpers";
import { AttachmentLocation } from "./attachments/attachment-location";
import { HasTemperature } from "../interfaces/has-temperature";
import { HasFuel } from "../interfaces/has-fuel";

export class ShipPod implements Updatable, CanTarget, CanThrust, HasLocation, HasGameObject, HasIntegrity, HasAttachments, HasTemperature, HasFuel {
    private id: string; // UUID
    private scene: Phaser.Scene;
    private gameObj: Phaser.GameObjects.Container;
    private target: HasLocation;
    private integrity: number;
    private attachments: ShipAttachment[];
    private thrustKey: Phaser.Input.Keyboard.Key;
    private boostKey: Phaser.Input.Keyboard.Key;
    private rotateAttachmentsClockwiseKey: Phaser.Input.Keyboard.Key;
    private rotateAttachmentsAntiClockwiseKey: Phaser.Input.Keyboard.Key;
    private detachAttachmentKey: Phaser.Input.Keyboard.Key;
    private remainingFuel: number = 100;
    private temperature: number = 0; // in Celcius
    private thrusterParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;

    active: boolean = true;
    
    constructor(scene: Phaser.Scene) {
        this.id = RNG.guid();
        this.scene = scene;
        this.gameObj = scene.add.container(0, 0);
        this.scene.physics.add.existing(this.gameObj);
        (this.gameObj.body as Phaser.Physics.Arcade.Body).bounce.setTo(0.7, 0.7);
        this.thrusterParticles = scene.add.particles('flares');
        let ship: Phaser.GameObjects.Sprite = scene.add.sprite(0, 0, 'ship-pod');
        this.gameObj.add(ship);
        
        this.integrity = Constants.MAX_INTEGRITY;
        this.attachments = new Array<ShipAttachment>(Helpers.enumLength(AttachmentLocation));

        this.setupInputHandlers();
    }

    update(): void {
        if (!Globals.paused && this.active) {
            this.lookAtTarget();
            if (this.thrustKey.isDown) {
                this.thrustFowards();
            }
            if (this.boostKey.isDown) {
                this.boostForwards();
            }
            if (this.scene.input.activePointer.leftButtonDown()) {
                if (this.attachments[0]) {
                    this.attachments[0].trigger();
                }
            }
            this.checkOverheatCondition();
            if (this.rotateAttachmentsClockwiseKey.isDown) {
                this.rotateAttachmentsClockwise();
            }
            if (this.rotateAttachmentsAntiClockwiseKey.isDown) {
                this.rotateAttachmentsAntiClockwise();
            }
            if (this.detachAttachmentKey.isDown) {
                this.removeAttachment(AttachmentLocation.front);
            }
            this.updateAttachments();
        }
    }

    private updateAttachments(): void {
        for (var i=0; i<this.attachments.length; i++) {
            let a: ShipAttachment = this.attachments[i];
            if (a) {
                a.update();
            }
        }
    }

    private setupInputHandlers(): void {
        this.thrustKey = this.scene.input.keyboard.addKey('SPACE', true, true);
        this.boostKey = this.scene.input.keyboard.addKey('TAB', true, false);
        this.rotateAttachmentsClockwiseKey = this.scene.input.keyboard.addKey('E', true, false);
        this.rotateAttachmentsAntiClockwiseKey = this.scene.input.keyboard.addKey('Q', true, false);
        this.detachAttachmentKey = this.scene.input.keyboard.addKey('X', true, false);
    }

    /**
     * checks for and applies damage based on degrees over safe temperature at a rate
     * defined by {Constants.OVERHEAT_CHECK_INTERVAL} milliseconds between each check.
     * also applies cooling at a rate of {Constants.COOLING_RATE}
     */
    private checkOverheatCondition(): void {
        if (!Globals.paused && this.active) {
            if (Helpers.now() - this.lastOverheatCheck > Constants.OVERHEAT_CHECK_INTERVAL) {
                if (this.temperature > Constants.MAX_TEMPERATURE) {
                    this.destroy(); // we are dead
                }
                if (this.temperature > Constants.MAX_SAFE_TEMPERATURE) {
                    // reduce integrity based on degrees over safe operating temp
                    let delta: number = (this.temperature - Constants.MAX_SAFE_TEMPERATURE) / Constants.MAX_SAFE_TEMPERATURE;
                    this.sustainDamage(delta);
                }
                this.applyCooling(Constants.COOLING_RATE);
                this.lastOverheatCheck = Helpers.now();
            }
        }
    }
    private lastOverheatCheck: number = 0;

    /**
     * TODO: needed so we can use Floating Origin
     */
    getRealLocation(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.gameObj.x, this.gameObj.y);
    }

    /**
     * the location within the viewable area
     * @returns a {Phaser.Math.Vector2} offset for location within current 
     * viewable area
     */
    getLocation(): Phaser.Math.Vector2 {
        let cameraPos: Phaser.Math.Vector2 = this.scene.cameras.main.getWorldPoint(0, 0);
        return new Phaser.Math.Vector2(this.gameObj.x - cameraPos.x, this.gameObj.y - cameraPos.y);
    }

    getId(): string {
        return this.id;
    }

    getGameObject(): Phaser.GameObjects.GameObject {
        return this.gameObj;
    }

    setTarget(target: HasLocation) {
        this.target = target;
    }

    lookAtTarget(): void {
        let pos = this.target.getRealLocation();
        let radians: number = Phaser.Math.Angle.Between(pos.x, pos.y, this.gameObj.x, this.gameObj.y);
        this.gameObj.setRotation(radians);
    }

    getAngle(): number {
        return this.gameObj.angle;
    }

    getRotation(): number {
        return this.gameObj.rotation;
    }

    getHeading(): Phaser.Math.Vector2 {
        let x: number = Math.cos(this.gameObj.rotation);
        let y: number = Math.sin(this.gameObj.rotation);
        return new Phaser.Math.Vector2(x, y).normalize().negate();
    }

    getVelocity(): number {
        return (this.gameObj.body as Phaser.Physics.Arcade.Body).velocity.length();
    }

    thrustFowards(): void {
        this.applyThrust(Constants.THRUSTER_FORCE, Constants.FUEL_PER_THRUST, Constants.HEAT_PER_THRUST);
        this.displayThrusterFire('yellow', 0.4);
    }

    boostForwards(): void {
        if (Helpers.now() - this.lastBoostTime >= Constants.BOOSTER_COOLDOWN_TIME) {
            this.applyThrust(Constants.BOOSTER_FORCE, Constants.FUEL_PER_BOOST, Constants.HEAT_PER_BOOST);
            this.displayThrusterFire('blue', 1);
            this.lastBoostTime = Helpers.now();
        }
    }
    private lastBoostTime: number = 0;

    private applyThrust(force: number, fuel: number, heat: number): void {
        if (this.getRemainingFuel() > 0) {
            let heading: Phaser.Math.Vector2 = this.getHeading();
            let deltaV: Phaser.Math.Vector2 = heading.multiply(new Phaser.Math.Vector2(force, force));
            (this.gameObj.body as Phaser.Physics.Arcade.Body).velocity.add(deltaV);
            
            this.reduceFuel(fuel);
            this.applyHeating(heat);
        }
    }

    private displayThrusterFire(colour: string, startScale: number): void {
        // make thruster fire
        let pos: Phaser.Math.Vector2 = this.getRealLocation();
        let offset: Phaser.Math.Vector2 = new Phaser.Math.Vector2(20, 0).add(this.getRealLocation());
        let loc: Phaser.Geom.Point = Phaser.Math.RotateAround(offset, pos.x, pos.y, this.getRotation());
        let h: Phaser.Math.Vector2 = this.getHeading().negate();
        this.thrusterParticles.createEmitter({
            frame: colour,
            x: loc.x,
            y: loc.y,
            lifespan: 500,
            speedX: { min: h.x*100, max: h.x*600 },
            speedY: { min: h.y*100, max: h.y*600 },
            angle: { min: -85, max: 95 },
            gravityX: 0,
            gravityY: 0,
            scale: { start: startScale, end: 0 },
            //quantity: 4,
            blendMode: 'ADD',
            maxParticles: 10
        });
    }

    strafeLeft(): void {

    }

    strafeRight(): void {

    }

    thrustBackwards(): void {

    }

    getTemperature(): number {
        return this.temperature;
    }

    applyHeating(degrees: number): void {
        this.temperature += degrees;
    }

    applyCooling(degrees: number): void {
        this.temperature -= degrees;
        if (this.temperature < 0) {
            this.temperature = 0;
        }
    }

    reduceFuel(amount: number): void {
        this.remainingFuel -= amount;
        if (this.remainingFuel < 0) {
            this.remainingFuel = 0;
        }
    }

    addFuel(amount: number): void {
        this.remainingFuel += amount;
        if (this.remainingFuel > Constants.MAX_FUEL) {
            this.remainingFuel = Constants.MAX_FUEL;
        }
    }

    getRemainingFuel(): number {
        return this.remainingFuel;
    }

    getIntegrity(): number {
        return this.integrity;
    }

    sustainDamage(amount: number): void {
        this.integrity -= amount;
        if (this.integrity <= 0) {
            this.integrity = 0;
            this.active = false;
            this.destroy(); // we are dead
        }
    }

    repair(amount: number): void {
        this.integrity = amount;
        if (this.integrity > Constants.MAX_INTEGRITY) {
            this.integrity = Constants.MAX_INTEGRITY;
        }
    }

    rotateAttachmentsClockwise(): void {
        let last: ShipAttachment = this.attachments.pop(); // remove last element
        this.attachments.unshift(last); // push last element onto start of array
        this.updateAttachmentPositions();
    }

    rotateAttachmentsAntiClockwise(): void {
        let first: ShipAttachment = this.attachments.shift(); // remove first element
        this.attachments.push(first); // push first element onto end of array
        this.updateAttachmentPositions();
    }

    private updateAttachmentPositions(): void {
        for (var i=0; i<this.attachments.length; i++) {
            if (this.attachments[i]) {
                switch (i) {
                    case AttachmentLocation.front:
                        this.attachments[i].setAttachmentLocation(AttachmentLocation.front);
                        break;
                    case AttachmentLocation.frontRight:
                        this.attachments[i].setAttachmentLocation(AttachmentLocation.frontRight);
                        break;
                    case AttachmentLocation.right:
                        this.attachments[i].setAttachmentLocation(AttachmentLocation.right);
                        break;
                    case AttachmentLocation.backRight:
                        this.attachments[i].setAttachmentLocation(AttachmentLocation.backRight);
                        break;
                    case AttachmentLocation.backLeft:
                        this.attachments[i].setAttachmentLocation(AttachmentLocation.backLeft);
                        break;
                    case AttachmentLocation.left:
                        this.attachments[i].setAttachmentLocation(AttachmentLocation.left);
                        break;
                    case AttachmentLocation.frontLeft:
                        this.attachments[i].setAttachmentLocation(AttachmentLocation.frontLeft);
                        break;
                }
            }
        }
    }

    /**
     * adds the passed in {ShipAttachment} in {AttachmentLocation.front} or
     * the first open {AttachmentLocation} in a clockwise search. if no open
     * slots exist then the existing {ShipAttachment} at {AttachmentLocation.front}
     * is detached and replaced with the passed in {ShipAttachment}
     * @param attachment the attachment to be added
     */
    addAttachment(attachment: ShipAttachment): void {
        let attached: boolean = false;
        for (var i=0; i<Helpers.enumLength(AttachmentLocation); i++) {
            if (!this.attachments[i]) {
                let loc: AttachmentLocation;
                switch (i) {
                    case AttachmentLocation.front:
                        loc = AttachmentLocation.front;
                        break;
                    case AttachmentLocation.frontRight:
                        loc = AttachmentLocation.frontRight;
                        break;
                    case AttachmentLocation.right:
                        loc = AttachmentLocation.right;
                        break;
                    case AttachmentLocation.backRight:
                        loc = AttachmentLocation.backRight;
                        break;
                    case AttachmentLocation.backLeft:
                        loc = AttachmentLocation.backLeft;
                        break;
                    case AttachmentLocation.left:
                        loc = AttachmentLocation.left;
                        break;
                    case AttachmentLocation.frontLeft:
                        loc = AttachmentLocation.frontLeft;
                        break;
                }
                this.attachments[i] = attachment;
                attachment.attach(this, loc);
                attached = true;
            }
        }

        if (!attached) {
            // detach current front attachment
            this.attachments[AttachmentLocation.front].detach();
            this.attachments[AttachmentLocation.front] = attachment;
            attachment.attach(this, AttachmentLocation.front);
        }

        this.gameObj.add(attachment.getGameObject());
    }

    removeAttachment(location: AttachmentLocation): void {
        if (this.attachments[location]) {
            let go: Phaser.GameObjects.GameObject = this.attachments[location].getGameObject();
            this.gameObj.remove(go);
            this.attachments[location].detach();
            this.attachments[location] = null;
        }
    }

    getAttachments(): ShipAttachment[] {
        return this.attachments;
    }

    destroy(): void {
        // TODO:
    }
}