import "phaser";
import { RNG } from "../utilities/rng";
import { Updatable } from "../interfaces/updatable";
import { CanTarget } from "../interfaces/can-target";
import { CanThrust } from "../interfaces/can-thrust";
import { HasLocation } from "../interfaces/has-location";
import { HasGameObject } from "../interfaces/has-game-object";
import { HasIntegrity } from "../interfaces/has-integrity";
import { Constants } from "../utilities/constants";
import { ShipAttachment } from "./attachments/ship-attachment";
import { HasAttachments } from "../interfaces/has-attachments";
import { Helpers } from "../utilities/helpers";
import { AttachmentLocation } from "./attachments/attachment-location";
import { HasTemperature } from "../interfaces/has-temperature";
import { HasFuel } from "../interfaces/has-fuel";
import { HasPhysicsGameObject } from "../interfaces/has-physics-game-object";

export class ShipPod implements Updatable, CanTarget, CanThrust, HasLocation, HasGameObject, HasPhysicsGameObject, HasIntegrity, HasAttachments, HasTemperature, HasFuel {
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
    private explosionParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;

    active: boolean = true;
    
    constructor(scene: Phaser.Scene) {
        this.id = RNG.guid();
        this.scene = scene;
        this.gameObj = scene.add.container(0, 0);
        this.scene.physics.add.existing(this.gameObj);
        this.getPhysicsBody().bounce.setTo(0.7, 0.7);
        this.getPhysicsBody().setMaxVelocity(Constants.MAX_VELOCITY, Constants.MAX_VELOCITY);
        this.thrusterParticles = scene.add.particles('flares', Constants.Flare.yellow);
        this.explosionParticles = scene.add.particles('explosion');
        let ship: Phaser.GameObjects.Sprite = scene.add.sprite(0, 0, 'ship-pod');
        this.gameObj.add(ship);
        
        this.integrity = Constants.MAX_INTEGRITY;
        this.attachments = new Array<ShipAttachment>(Helpers.enumLength(AttachmentLocation));

        this.setupInputHandlers();
    }

    update(): void {
        if (this.active) {
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
            if (this.scene.input.activePointer.rightButtonDown()) {
                if (this.attachments[0]) {
                    this.throwAttachment(this.attachments[0]);
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
        if (this.active) {
            if (this.scene.game.getTime() > this.lastOverheatCheck + Constants.OVERHEAT_CHECK_INTERVAL) {
                if (this.temperature > Constants.MAX_TEMPERATURE) {
                    this.destroy(); // we are dead
                }
                if (this.temperature > Constants.MAX_SAFE_TEMPERATURE) {
                    // reduce integrity based on degrees over safe operating temp
                    let delta: number = (this.temperature - Constants.MAX_SAFE_TEMPERATURE) / Constants.MAX_SAFE_TEMPERATURE;
                    this.sustainDamage(delta);
                }
                this.applyCooling(Constants.COOLING_RATE);
                this.lastOverheatCheck = this.scene.game.getTime();
            }
        }
    }
    private lastOverheatCheck: number = 0;

    /**
     * TODO: needed so we can use Floating Origin
     */
    getRealLocation(): Phaser.Math.Vector2 {
        if (this.getGameObject()) {
            return new Phaser.Math.Vector2(this.gameObj.x, this.gameObj.y);
        }
        return Phaser.Math.Vector2.ZERO;
    }

    /**
     * the location within the viewable area
     * @returns a {Phaser.Math.Vector2} offset for location within current 
     * viewable area
     */
    getLocation(): Phaser.Math.Vector2 {
        if (this.getGameObject()) {
            let cameraPos: Phaser.Math.Vector2 = this.scene.cameras.main.getWorldPoint(0, 0);
            return new Phaser.Math.Vector2(this.gameObj.x - cameraPos.x, this.gameObj.y - cameraPos.y);
        }
        return Phaser.Math.Vector2.ZERO;
    }

    getId(): string {
        return this.id;
    }

    getGameObject(): Phaser.GameObjects.GameObject {
        return this.gameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        if (this.getGameObject()) {
            return this.getGameObject().body as Phaser.Physics.Arcade.Body;
        }
        return null;
    }

    setTarget(target: HasLocation) {
        this.target = target;
    }

    getTarget(): HasLocation {
        return this.target;
    }

    lookAtTarget(): void {
        if (this.getPhysicsBody()) {
            if (this.getTarget()) {
                let targetPos = this.getTarget().getRealLocation();
                let shipPos = this.getRealLocation();
                let radians: number = Phaser.Math.Angle.Between(targetPos.x, targetPos.y, shipPos.x, shipPos.y);
                let degrees: number = Phaser.Math.RadToDeg(radians);
                this.getPhysicsBody().rotation = degrees;
            }
        }
    }

    /**
     * the rotation of the Ship's {GameObject.body} in degrees
     */
    getRotation(): number {
        if (this.getPhysicsBody()) {
            return this.getPhysicsBody().rotation;
        }
        return 0;
    }

    getHeading(): Phaser.Math.Vector2 {
        return Helpers.getHeading(this.getPhysicsBody());
    }

    getSpeed(): number {
        return this.getVelocity().length();
    }

    getVelocity(): Phaser.Math.Vector2 {
        if (this.getPhysicsBody()) {
            return this.getPhysicsBody().velocity.clone();
        }
        return Phaser.Math.Vector2.ZERO;
    }

    thrustFowards(): void {
        this.applyThrust(Constants.THRUSTER_FORCE, Constants.FUEL_PER_THRUST, Constants.HEAT_PER_THRUST);
        this.displayThrusterFire(Constants.Flare.yellow, 0.2, 1);
    }

    boostForwards(): void {
        if (Helpers.now() - this.lastBoostTime >= Constants.BOOSTER_COOLDOWN_TIME) {
            this.applyThrust(Constants.BOOSTER_FORCE, Constants.FUEL_PER_BOOST, Constants.HEAT_PER_BOOST);
            this.displayThrusterFire(Constants.Flare.blue, 1, 10);
            this.lastBoostTime = Helpers.now();
        }
    }
    private lastBoostTime: number = 0;

    private applyThrust(force: number, fuel: number, heat: number): void {
        if (this.getRemainingFuel() > 0) {
            let heading: Phaser.Math.Vector2 = this.getHeading();
            let deltaV: Phaser.Math.Vector2 = heading.multiply(new Phaser.Math.Vector2(force, force));
            this.getPhysicsBody().velocity.add(deltaV);
            
            this.reduceFuel(fuel);
            this.applyHeating(heat);
        }
    }

    private displayThrusterFire(colour: Constants.Flare, startScale: number, quantity: number): void {
        // make thruster fire
        let pos: Phaser.Math.Vector2 = this.getRealLocation();
        let offset: Phaser.Math.Vector2 = new Phaser.Math.Vector2(20, 0).add(pos);
        let h: Phaser.Math.Vector2 = this.getHeading().negate();
        let loc: Phaser.Geom.Point = Phaser.Math.RotateAround(offset, pos.x, pos.y, Phaser.Math.DegToRad(this.getRotation()));
        let v: Phaser.Math.Vector2 = this.getVelocity();
        this.thrusterParticles.createEmitter({
            frame: colour as number,
            x: loc.x,
            y: loc.y,
            lifespan: { min: 250, max: 500 },
            speedX: { min: h.x*100, max: h.x*500 },
            speedY: { min: h.y*100, max: h.y*500 },
            angle: 0,
            gravityX: 0,
            gravityY: 0,
            scale: { start: startScale, end: 0 },
            quantity: quantity,
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
            let body: Phaser.Physics.Arcade.Body = this.attachments[location].getPhysicsBody();
            
            let go: Phaser.GameObjects.GameObject = this.attachments[location].getGameObject();
            this.gameObj.remove(go, false);
            this.attachments[location].detach();
            this.attachments[location] = null;

            // move attachment to ship location and rotation and apply current velocity
            body.position = this.getRealLocation();
            let shipVelocityVector: Phaser.Math.Vector2 = this.getPhysicsBody().velocity;
            body.setVelocity(shipVelocityVector.x, shipVelocityVector.y);
            body.rotation = this.getRotation();
        }
    }

    throwAttachment(attachment: ShipAttachment): void {
        if (attachment) {
            for (var i=0; i<this.attachments.length; i++) {
                if (this.attachments[i] && this.attachments[i] == attachment) {
                    this.removeAttachment(i);
                    
                    attachment.throw();
                    break;
                }
            }
        }
    }

    getAttachments(): ShipAttachment[] {
        return this.attachments;
    }

    destroy(): void {
        this.active = false;
        this.displayShipExplosion();
        this.getGameObject().destroy();
        this.gameObj = null;
        // TODO: signal end of game and display menu
    }

    private displayShipExplosion(): void {
        let pos: Phaser.Math.Vector2 = this.getRealLocation();
        this.explosionParticles.createEmitter({
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
        this.thrusterParticles.createEmitter({
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
}