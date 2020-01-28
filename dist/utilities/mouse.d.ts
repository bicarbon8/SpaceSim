import { HasLocation } from "../interfaces/has-location";
export declare class Mouse implements HasLocation {
    private scene;
    private location;
    constructor(scene: Phaser.Scene);
    /**
     * returns the position of the mouse within the bounds of the current
     * screen.
     * @returns a {Phaser.Math.Vector2} clone of the position
     */
    getPosition(): Phaser.Math.Vector2;
    /**
     * offsets the screen position based on camera position
     */
    getRealPosition(): Phaser.Math.Vector2;
}
