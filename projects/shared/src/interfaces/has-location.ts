export type HasLocation = {
    /**
     * the location within the viewable area
     * @returns a `Phaser.Math.Vector2` offset for location within current 
     * viewable area (screen / window)
     */
    getLocationInView(): Phaser.Math.Vector2;
    /**
     * sets the location of this object in screen space
     * @param location the location in screen space
     */
    setLocationInView(location: Phaser.Types.Math.Vector2Like): void;
    /**
     * the location within coordinate space
     * @returns a `Phaser.Math.Vector2` for the location of this
     * object in coordinate space. this is different from the
     * location on screen which is found using `getLocationInView`
     */
    getLocation(): Phaser.Math.Vector2;
    /**
     * sets the location of this object in coordinate space
     * @param location the location in coordinate space
     */
    setLocation(location: Phaser.Types.Math.Vector2Like): void;
};