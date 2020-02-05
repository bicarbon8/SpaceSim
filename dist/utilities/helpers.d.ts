export declare module Helpers {
    /**
     * get the number of elements in an enum.
     * <p>
     * ex: <i>enum Foo { bar = 0, baz = 1, boz = 2 }</i><br />
     * returns: <b>3</b>
     * </p>
     * @param enumType the type name of an enum
     * @returns the number of elements in the enum
     */
    function enumLength(enumType: any): number;
    /**
     * @returns the current time in milliseconds since the epoch
     */
    function now(): number;
    /**
     * returns a {Phaser.Math.Vector2} that represents a normalised vector of direction
     * based on the rotation of the passed in {Phaser.Physics.Arcade.Body}
     * @param body the physics enabled {GameObject.body} from which to get the heading
     */
    function getHeading(body: Phaser.Physics.Arcade.Body): Phaser.Math.Vector2;
    /**
     * applies the passed in offset to a rotated body equivalent to reversing the
     * rotation, applying the offset and then re-applying the offset
     * @param body the {Phaser.Physics.Arcade.Body} to offset
     * @param offset a {Phaser.Math.Vector2} representing the unrotated offset to apply
     */
    function offsetWithHeading(body: Phaser.Physics.Arcade.Body, offset: Phaser.Math.Vector2): void;
}
