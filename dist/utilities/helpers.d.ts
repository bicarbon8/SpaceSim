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
     * returns a {Phaser.Math.Vector2} that represents a normalised vector of direction
     * based on the passed in rotation
     * @param rotation the rotation in degrees
     */
    function getHeading(rotation: number): Phaser.Math.Vector2;
    function vector2(x: number, y?: number): Phaser.Math.Vector2;
}
