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
     * @returns the current time in milliseconds since the epoch
     */
    export function now(): number {
        return new Date().getTime();
    }

    /**
     * returns a {Phaser.Math.Vector2} that represents a normalised vector of direction
     * based on the rotation of the passed in {Phaser.Physics.Arcade.Body}
     * @param body the physics enabled {GameObject.body} from which to get the heading
     */
    export function getHeading(body: Phaser.Physics.Arcade.Body): Phaser.Math.Vector2 {
        if (body) {
            let x: number = Math.cos(Phaser.Math.DegToRad(body.rotation));
            let y: number = Math.sin(Phaser.Math.DegToRad(body.rotation));
            return new Phaser.Math.Vector2(x, y).normalize().negate();
        }
        return Phaser.Math.Vector2.ZERO;
    }

    /**
     * applies the passed in offset to a rotated body equivalent to reversing the
     * rotation, applying the offset and then re-applying the offset
     * @param body the {Phaser.Physics.Arcade.Body} to offset
     * @param offset a {Phaser.Math.Vector2} representing the unrotated offset to apply
     */
    export function offsetWithHeading(body: Phaser.Physics.Arcade.Body, offset: Phaser.Math.Vector2): void {
        let heading: Phaser.Math.Vector2 = Helpers.getHeading(body);
        heading.multiply(offset);
        body.position.add(heading);
    }
}