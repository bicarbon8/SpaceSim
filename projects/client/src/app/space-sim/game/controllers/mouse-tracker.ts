import { Scene } from "phaser";
import { HasLocation, Updatable, SpaceSim, Helpers } from "space-sim-shared";
import { SpaceSimClient } from "../space-sim-client";

export class MouseTracker implements HasLocation, Updatable {
    private _scene: Scene;
    
    public active: boolean = true;

    constructor(scene: Phaser.Scene) {
        this._scene = scene;
    }

    update(time: number, delta: number): void {
        if (this.active) {
            this._setShipAngle();
        }
    }

    getAngle(): number {
        return this._pointer()?.getAngle() || 0;
    }

    getRotation(): number {
        return this.getAngle() * (Math.PI / 180);
    }

    setRotation(degrees: number): void {
        /* not supported */
    }

    getHeading(): Phaser.Math.Vector2 {
        let rotation: number = this.getAngle();
        let x: number = Math.cos(rotation);
        let y: number = Math.sin(rotation);
        return new Phaser.Math.Vector2(x, y).normalize().negate();
    }

    getSpeed(): number {
        return this.getVelocity().length();
    }

    getVelocity(): Phaser.Math.Vector2 {
        return this._pointer()?.velocity?.clone() || Helpers.vector2();
    }

    /**
     * returns the position of the mouse within the bounds of the current
     * screen.
     * @returns a {Vector2} clone of the position
     */
    get locationInView(): Phaser.Types.Math.Vector2Like {
        // console.log(`mouse location: ${JSON.stringify(this.location)}`);
        return this._pointer()?.position?.clone() || Helpers.vector2();
    }

    setLocationInView(location: Phaser.Types.Math.Vector2Like): void {
        throw new Error('MouseTracker.setLocationInView(...) is not supported');
    }

    /**
     * offsets the screen position based on camera position
     */
    get location(): Phaser.Types.Math.Vector2Like {
        // console.log(`mouse REAL location: ${JSON.stringify(world)}`);
        return this._pointer()?.positionToCamera(this._scene?.cameras?.main) as Phaser.Math.Vector2;
    }

    setLocation(location: Phaser.Math.Vector2): void {
        /* not supported! */
    }

    private _pointer(): Phaser.Input.Pointer {
        return this._scene?.input?.activePointer;
    }

    private _setShipAngle(): void {
        if (this._scene) {
            const loc = this.location;
            const shipPos = this._ship.location;
            const radians: number = Phaser.Math.Angle.Between(loc.x, loc.y, shipPos.x, shipPos.y);
            const degrees: number = +Phaser.Math.RadToDeg(radians).toFixed(0);
            // only update if angle changed more than minimum allowed degrees
            if (!Phaser.Math.Fuzzy.Equal(this._ship.rotationContainer.angle, degrees, SpaceSim.Constants.Ships.MIN_ROTATION_ANGLE)) {
                SpaceSimClient.socket?.sendSetShipAngleRequest(degrees, SpaceSimClient.playerData);
                this._ship.rotationContainer.setAngle(degrees);
            }
        }
    }
}