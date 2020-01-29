import { ShipPod } from "../ship-pod";
import { HasGameObject } from "../../interfaces/has-game-object";
import { Updatable } from "../../interfaces/updatable";
import { HasLocation } from "../../interfaces/has-location";
import { HasIntegrity } from "../../interfaces/has-integrity";
import { Constants } from "../../utilities/constants";

export abstract class ShipAttachment implements Updatable, HasGameObject, HasLocation, HasIntegrity {
    private ship: ShipPod;
    private scene: Phaser.Scene;
    private gameObj: Phaser.Physics.Arcade.Sprite;
    private integrity: number;

    active: boolean;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.active = true;
        this.integrity = 100;
    }

    attach(ship: ShipPod): void {
        this.ship = ship;
    }

    detach(): void {
        this.ship = null;
    }
    
    getGameObject(): Phaser.GameObjects.GameObject {
        return this.gameObj;
    }

    update(): void {

    }

    getPosition(): Phaser.Math.Vector2 {
        let cameraPos: Phaser.Math.Vector2 = this.scene.cameras.main.getWorldPoint(0, 0);
        return new Phaser.Math.Vector2(this.gameObj.x - cameraPos.x, this.gameObj.y - cameraPos.y);
    }

    getRealPosition(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.gameObj.x, this.gameObj.y);
    }

    getIntegrity(): number {
        return this.integrity;
    }

    sustainDamage(amount: number): void {
        this.integrity -= amount;
        if (this.integrity <= 0) {
            this.integrity = 0;
            this.active = false;
            // TODO: destroy attachment
        }
    }

    repair(): void {
        this.integrity = Constants.MAX_INTEGRITY;
    }
}