import { Scene } from "phaser";
import { HasLocation } from "../interfaces/has-location";
import { Helpers } from "./helpers";

export class TouchTracker implements HasLocation {
    private _scene: Scene;
    private _previousPosition: Phaser.Math.Vector2;
    private _position: Phaser.Math.Vector2;
    
    constructor(scene: Scene) {
        this._scene = scene;

        this._previousPosition = Helpers.vector2();
        this._position = Helpers.vector2();
    }

    getAngle(): number {
        return Phaser.Math.Angle.BetweenPoints(this._previousPosition, this._position) || 0;
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
        let elapsed: number = this._scene.game?.loop.delta;
        let current: Phaser.Math.Vector2 = this.getLocationInView();
        let previous: Phaser.Math.Vector2 = this._previousPosition;
        let deltaX: number = previous.x - current.x;
        let deltaY: number = previous.y - current.y;
        return Helpers.vector2(deltaX * elapsed, deltaY * elapsed);
    }

    setLocation(location: Phaser.Math.Vector2): void {
        this._previousPosition = this._position;
        this._position = location;
    }

    /**
     * returns the position where a touch action occurred on screen
     * @returns a {Vector2} clone of the position
     */
    getLocationInView(): Phaser.Math.Vector2 {
        return this._position?.clone() || Helpers.vector2();
    }

    /**
     * offsets the screen position based on ship position
     */
    getLocation(): Phaser.Math.Vector2 {
        // console.log(`mouse REAL location: ${JSON.stringify(world)}`);
        return this._pointer()?.positionToCamera(this._scene?.cameras?.main) as Phaser.Math.Vector2;
    }

    onSpread(func: any): void {
        // this._scene?.input.on(Input.Events.POINTER_WHEEL, (pointer: Phaser.Input.Pointer, currentlyOver: any, dx: number, dy: number, dz: number, event: Event) => {
        //     if (dy > 0) {
        //         func(dy);
        //     }
        // });
    }

    onPinch(func: any): void {
        // this._scene?.input.on(Input.Events.POINTER_WHEEL, (pointer: Phaser.Input.Pointer, currentlyOver: any, dx: number, dy: number, dz: number, event: Event) => {
        //     if (dy < 0) {
        //         func(-dy);
        //     }
        // });
    }

    private _pointer(): Phaser.Input.Pointer {
        return this._scene?.input?.activePointer;
    }
}