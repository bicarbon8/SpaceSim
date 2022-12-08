export interface HasLocation {
    getRotation(): number;
    getHeading(): Phaser.Math.Vector2;
    getSpeed(): number;
    getVelocity(): Phaser.Math.Vector2;
    /**
     * the location within the viewable area
     * @returns a {Phaser.Math.Vector2} offset for location within current 
     * viewable area
     */
    getLocationInView(): Phaser.Math.Vector2;
    /**
     * the location within coordinate space
     * @returns a {Phaser.Math.Vector2} for the location of this
     * {Ship} in coordinate space. this is different from the
     * location on screen which is found using {getLocationInView}
     */
    getLocation(): Phaser.Math.Vector2;
    /**
     * sets the location of this object in coordinate space
     * @param location the location in coordinate space
     */
    setLocation(location: Phaser.Math.Vector2): void;
}