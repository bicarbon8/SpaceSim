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

export class ShipPod implements Updatable, CanTarget, CanThrust, HasLocation, HasGameObject, HasIntegrity, HasAttachments, HasTemperature {
    private id: string; // UUID
    private scene: Phaser.Scene;
    private gameObj: Phaser.Physics.Arcade.Sprite;
    private target: HasLocation;
    private integrity: number;
    private attachments: ShipAttachment[];
    private thrustKey: Phaser.Input.Keyboard.Key;
    private rotateAttachmentsClockwiseKey: Phaser.Input.Keyboard.Key;
    private rotateAttachmentsAntiClockwiseKey: Phaser.Input.Keyboard.Key;
    private remainingFuel: number = 100;
    private temperature: number = 0; // in Celcius

    active: boolean = true;
    
    constructor(scene: Phaser.Scene) {
        this.id = RNG.guid();
        this.scene = scene;
        this.gameObj = scene.physics.add.sprite(0, 0, 'ship-pod');

        this.integrity = Constants.MAX_INTEGRITY;
        this.attachments = new Array<ShipAttachment>(Helpers.enumLength(AttachmentLocation));

        this.setTarget(Globals.mouse);
        this.setupInputHandlers();
        this.checkOverheatCondition();
    }

    update(): void {
        if (!Globals.isPaused && this.active) {
            this.lookAtTarget();
            if (this.thrustKey.isDown) {
                this.thrustFowards();
            }
            if (this.rotateAttachmentsClockwiseKey.isDown) {
                this.rotateAttachmentsClockwise();
            }
            if (this.rotateAttachmentsAntiClockwiseKey.isDown) {
                this.rotateAttachmentsAntiClockwise();
            }
        }
    }

    private setupInputHandlers(): void {
        this.thrustKey = this.scene.input.keyboard.addKey('SPACE', true, true);
        this.rotateAttachmentsClockwiseKey = this.scene.input.keyboard.addKey('E', true, true);
        this.rotateAttachmentsAntiClockwiseKey = this.scene.input.keyboard.addKey('Q', true, true);
    }

    /**
     * checks for and applies damage based on degrees over safe temperature at a rate
     * defined by {Constants.OVERHEAT_CHECK_INTERVAL} milliseconds between each check.
     * also applies cooling at a rate of {Constants.COOLING_RATE}
     */
    private checkOverheatCondition(): void {
        if (!Globals.isPaused && this.active) {
            if (this.temperature > Constants.MAX_TEMPERATURE) {
                this.destroy(); // we are dead
            }
            if (this.temperature > Constants.MAX_SAFE_TEMPERATURE) {
                // reduce integrity based on degrees over safe operating temp
                let delta: number = this.temperature - Constants.MAX_SAFE_TEMPERATURE;
                this.integrity -= delta;
            }
            this.applyCooling(Constants.COOLING_RATE);
        }
        setTimeout(this.checkOverheatCondition, Constants.OVERHEAT_CHECK_INTERVAL);
    }

    /**
     * TODO: needed so we can use Floating Origin
     */
    getRealPosition(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.gameObj.x, this.gameObj.y);
    }

    /**
     * the location within the viewable area
     * @returns a {Phaser.Math.Vector2} offset for location within current 
     * viewable area
     */
    getPosition(): Phaser.Math.Vector2 {
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
        let pos = this.target.getRealPosition();
        let radians: number = Phaser.Math.Angle.Between(pos.x, pos.y, this.gameObj.x, this.gameObj.y);
        this.gameObj.setRotation(radians);
    }

    getHeading(): Phaser.Math.Vector2 {
        let x: number = Math.cos(this.gameObj.rotation);
        let y: number = Math.sin(this.gameObj.rotation);
        return new Phaser.Math.Vector2(x, y).normalize().negate();
    }

    thrustFowards(): void {
        if (this.remainingFuel > 0) {
            let heading: Phaser.Math.Vector2 = this.getHeading();
            let deltaV: Phaser.Math.Vector2 = heading.multiply(new Phaser.Math.Vector2(Constants.THRUSTER_FORCE, Constants.THRUSTER_FORCE));
            this.gameObj.body.velocity.add(deltaV);

            this.reduceFuel(Constants.FUEL_PER_THRUST);
            this.applyHeating(Constants.HEAT_PER_THRUST);
        }
    }

    strafeLeft(): void {

    }

    strafeRight(): void {

    }

    thrustBackwards(): void {

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
    }

    rotateAttachmentsAntiClockwise(): void {
        let first: ShipAttachment = this.attachments.shift(); // remove first element
        this.attachments.push(first); // push first element onto end of array
    }

    /**
     * replaces the attachment in {AttachmentLocation.front}
     * with the passed in {ShipAttachment}. if no attachment
     * in the {AttachmentLocation.front} slot then it is 
     * simply added.
     * @param attachment the attachment to be added
     */
    addAttachment(attachment: ShipAttachment): void {
        if (this.attachments[AttachmentLocation.front]) {
            let a: ShipAttachment = this.attachments[AttachmentLocation.front];
            a.detach();
        }
        this.attachments[AttachmentLocation.front] = attachment;
        attachment.attach(this);
    }

    destroy(): void {
        // TODO:
    }
}