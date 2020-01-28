import { HasLocation } from "../interfaces/has-location";

export class Mouse implements HasLocation {
    private scene: Phaser.Scene;
    private location: Phaser.Math.Vector2;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.location = Phaser.Math.Vector2.ZERO;
        this.scene.input.on('pointermove', (pointer: Phaser.Math.Vector2) => {
            this.location = new Phaser.Math.Vector2(pointer.x, pointer.y);
        });
    }

    /**
     * returns the position of the mouse within the bounds of the current
     * screen.
     * @returns a {Phaser.Math.Vector2} clone of the position
     */
    getPosition(): Phaser.Math.Vector2 {
        // console.log(`mouse location: ${JSON.stringify(this.location)}`);
        return this.location.clone();
    }

    /**
     * offsets the screen position based on camera position
     */
    getRealPosition(): Phaser.Math.Vector2 {
        let world: Phaser.Math.Vector2 = this.scene.cameras.main.getWorldPoint(this.location.x, this.location.y);
        // console.log(`mouse REAL location: ${JSON.stringify(world)}`);
        return world;
    }
}