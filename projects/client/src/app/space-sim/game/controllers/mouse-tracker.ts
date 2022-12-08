import { Scene } from "phaser";
import { HasLocation, Helpers } from "space-sim-server";

export class MouseTracker implements HasLocation {
    private _scene: Scene;
    
    constructor(scene: Scene) {
        this._scene = scene;
    }

    getAngle(): number {
        return this._pointer()?.getAngle() || 0;
    }

    getRotation(): number {
        return this.getAngle() * (Math.PI / 180);
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
    getLocationInView(): Phaser.Math.Vector2 {
        // console.log(`mouse location: ${JSON.stringify(this.location)}`);
        return this._pointer()?.position?.clone() || Helpers.vector2();
    }

    /**
     * offsets the screen position based on camera position
     */
    getLocation(): Phaser.Math.Vector2 {
        // console.log(`mouse REAL location: ${JSON.stringify(world)}`);
        return this._pointer()?.positionToCamera(this._scene?.cameras?.main) as Phaser.Math.Vector2;
    }

    setLocation(location: Phaser.Math.Vector2): void {
        /* not supported! */
    }

    private _pointer(): Phaser.Input.Pointer {
        return this._scene?.input?.activePointer;
    }
}