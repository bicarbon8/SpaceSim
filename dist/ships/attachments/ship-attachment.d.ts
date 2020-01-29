import { ShipPod } from "../ship-pod";
import { HasGameObject } from "../../interfaces/has-game-object";
import { Updatable } from "../../interfaces/updatable";
import { HasLocation } from "../../interfaces/has-location";
import { HasIntegrity } from "../../interfaces/has-integrity";
export declare abstract class ShipAttachment implements Updatable, HasGameObject, HasLocation, HasIntegrity {
    private ship;
    private scene;
    private gameObj;
    private integrity;
    active: boolean;
    constructor(scene: Phaser.Scene);
    attach(ship: ShipPod): void;
    detach(): void;
    getGameObject(): Phaser.GameObjects.GameObject;
    update(): void;
    getPosition(): Phaser.Math.Vector2;
    getRealPosition(): Phaser.Math.Vector2;
    getIntegrity(): number;
    sustainDamage(amount: number): void;
    repair(): void;
}
