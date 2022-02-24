import { ShipPod } from "../../ships/ship-pod";
import { InputController } from "./input-controller";

export class AiController extends InputController {
    private _aiShip: ShipPod;
    private _lastKnownPlayerLocation: Phaser.Math.Vector2;
    
    constructor(scene: Phaser.Scene, aiShip: ShipPod) {
        super(scene);
        this._aiShip = aiShip;
    }
    
    update(time: number, delta: number): void {
        if (!this.player) {
            this._patrol();
        } else {
            if (this._canSeePlayer()) {
                this._lastKnownPlayerLocation = this.player.getLocation();
            } else {
                if (this._aiShip.getLocation().fuzzyEquals(this._lastKnownPlayerLocation, 1)) {
                    this._patrol();
                } else {
                    this._goToLocation(this._lastKnownPlayerLocation);
                }
            }
        }
    }

    async goTo(location: Phaser.Math.Vector2): Promise<void> {
        let startingPos: Phaser.Math.Vector2 = this._aiShip.getLocation();
        let distance: number = location.distance(startingPos);
        this._aiShip.lookAt(location);
        this._aiShip.getThruster().thrustFowards();
        
    }

    private _patrol(): void {
        this._aiShip.setRotation(this._aiShip.getRotation() + 1);
    }

    private _canSeePlayer(): boolean {
        let canSee: boolean = false;

        return canSee;
    }

    private _lookForPlayer(): void {

    }

    private _chasePlayer(): void {

    }

    private _hideFromPlayer(): void {

    }

    private _goToLocation(location: Phaser.Math.Vector2): void {
        let path: Phaser.Math.Vector2[] = this._generatePathToLocation(location);
    }

    private _generatePathToLocation(location: Phaser.Math.Vector2): Phaser.Math.Vector2[] {
        let path: Phaser.Math.Vector2[] = [];

        return path;
    }
}