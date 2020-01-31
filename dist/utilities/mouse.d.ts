import { HasLocation } from "../interfaces/has-location";
import { MouseWheelScroll } from "../interfaces/mouse-wheel-scroll";
export declare class Mouse implements HasLocation {
    private scene;
    constructor(scene: Phaser.Scene);
    getAngle(): number;
    getHeading(): Phaser.Math.Vector2;
    getVelocity(): number;
    /**
     * returns the position of the mouse within the bounds of the current
     * screen.
     * @returns a {Phaser.Math.Vector2} clone of the position
     */
    getLocation(): Phaser.Math.Vector2;
    /**
     * offsets the screen position based on camera position
     */
    getRealLocation(): Phaser.Math.Vector2;
    onWheelUp<T extends MouseWheelScroll>(func: T): void;
    onWheelDown<T extends MouseWheelScroll>(func: T): void;
}
