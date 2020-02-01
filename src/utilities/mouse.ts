import { HasLocation } from "../interfaces/has-location";
import { MouseWheelScroll } from "../interfaces/mouse-wheel-scroll";

export class Mouse implements HasLocation {
    private scene: Phaser.Scene;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.scene.input.mouse.capture = true;
    }

    getAngle(): number {
        return this.scene.input.activePointer.getAngle();
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

    getVelocity(): number {
        return this.scene.input.activePointer.velocity.length();
    }

    /**
     * returns the position of the mouse within the bounds of the current
     * screen.
     * @returns a {Phaser.Math.Vector2} clone of the position
     */
    getLocation(): Phaser.Math.Vector2 {
        // console.log(`mouse location: ${JSON.stringify(this.location)}`);
        return this.scene.input.activePointer.position.clone();
    }

    /**
     * offsets the screen position based on camera position
     */
    getRealLocation(): Phaser.Math.Vector2 {
        let loc: Phaser.Math.Vector2 = this.getLocation();
        let world: Phaser.Math.Vector2 = this.scene.cameras.main.getWorldPoint(loc.x, loc.y);
        // console.log(`mouse REAL location: ${JSON.stringify(world)}`);
        return world;
    }

    onWheelUp<T extends MouseWheelScroll>(func: T): void {
        this.scene.input.on(Phaser.Input.Events.POINTER_WHEEL, (pointer, currentlyOver, dx, dy, dz, event) => {
            if (dy > 0) {
                func(dy);
            }
        });
    }

    onWheelDown<T extends MouseWheelScroll>(func: T): void {
        this.scene.input.on(Phaser.Input.Events.POINTER_WHEEL, (pointer, currentlyOver, dx, dy, dz, event) => {
            if (dy < 0) {
                func(-dy);
            }
        });
    }
}