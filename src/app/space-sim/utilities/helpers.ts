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
        let x: number = Math.cos(Phaser.Math.DegToRad(rotation));
        let y: number = Math.sin(Phaser.Math.DegToRad(rotation));
        return new Phaser.Math.Vector2(x, y).normalize().negate();
    }

    export function vector2(x: number = 0, y?: number): Phaser.Math.Vector2 {
        if (!y) {
            y = x;
        }
        return new Phaser.Math.Vector2(x, y);
    }
}