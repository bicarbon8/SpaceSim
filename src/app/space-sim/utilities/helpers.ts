export module Helpers {
    /**
     * get the number of elements in an enum.
     * <p>
     * ex: <i>enum Foo { bar = 0, baz = 1, boz = 2 }</i><br />
     * returns: <b>3</b>
     * </p>
     * @param enumType the type name of an enum
     * @returns the number of elements in the enum
     */
    export function enumLength(enumType: any): number {
        let count = 0;
        for(let item in enumType) {
            if(isNaN(Number(item))) {
                count++;
            }
        }
        return count;
    }

    /**
     * returns a {Vector2} that represents a normalised vector of direction
     * based on the passed in rotation
     * @param rotation the rotation in degrees
     */
    export function getHeading(rotation: number): Phaser.Math.Vector2 {
        let x: number = Math.cos(deg2rad(rotation));
        let y: number = Math.sin(deg2rad(rotation));
        return new Phaser.Math.Vector2(x, y).normalize().negate();
    }

    export function vector2(x: number = 0, y?: number): Phaser.Math.Vector2 {
        if (!y) {
            y = x;
        }
        return new Phaser.Math.Vector2(x, y);
    }

    export function rad2deg(radians: number): number {
        // 1Rad × 180/π
        return Phaser.Math.RadToDeg(radians); // radians * (180 / Math.PI);
    }

    export function deg2rad(degrees: number): number {
        // 1Deg × π/180
        return Phaser.Math.DegToRad(degrees); // degrees * (Math.PI / 180);
    }

    /**
     * converts location in coordinate space to the location within the viewable area.
     * NOTE: this assumes that the camera is always centred on the view and moves with
     * the player
     * @returns a {Phaser.Math.Vector2} location within current viewable area
     */
    export function convertLocToLocInView(location: Phaser.Math.Vector2, scene: Phaser.Scene): Phaser.Math.Vector2 {
        // NOTE: point 0,0 for the camera is the centre of the canvas where the ship appears
        let cameraPos: Phaser.Math.Vector2 = scene.cameras.main.getWorldPoint(0, 0);
        return new Phaser.Math.Vector2(location.x - cameraPos.x, location.y - cameraPos.y);
    }
}