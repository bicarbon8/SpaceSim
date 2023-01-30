export module PhaserHelpers {
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
     * @returns a `Phaser.Math.Vector2` location within current viewable area
     */
    export function convertLocToLocInView(location: Phaser.Types.Math.Vector2Like, scene: Phaser.Scene): Phaser.Math.Vector2 {
        // NOTE: point 0,0 for the camera is the centre of the canvas where the ship appears
        const cameraPos: Phaser.Math.Vector2 = scene.cameras.main.getWorldPoint(0, 0);
        return new Phaser.Math.Vector2(location.x - cameraPos.x, location.y - cameraPos.y).negate();
    }

    /**
     * converts location in the screen or view to a location in world space
     * @param location the location in the view to be converted to world space
     * @param scene the current scene
     * @returns a `Phaser.Math.Vector2` location within world space
     */
    export function convertLocInViewToLoc(location: Phaser.Types.Math.Vector2Like, scene: Phaser.Scene): Phaser.Math.Vector2 {
        return scene.cameras.main.getWorldPoint(location.x, location.y);
    }

    /**
     * create a view window for an object based on field of view, location, angle and distance
     * that can be used with `view.contains(Phaser.GameObjects.GameObject)` to determine if an object
     * can be seen or not
     * @param location the location of the object where the view originates
     * @param angle the heading angle of the object (where the object is looking)
     * @param distance how far the object can see from itself
     * @param fieldOfView the width of the view in degrees @default 160
     * @param steps the number of steps used to generate (less is faster, but less accurate) @default 6
     * @returns a Phaser Geometry Polygon representing the view
     */
    export function getView(location: Phaser.Types.Math.Vector2Like, angle: number, distance: number, fieldOfView: number = 160, steps: number = 6): Phaser.Geom.Polygon {
        let rotationAngle = angle - (fieldOfView / 2);
        const offsetAngle = fieldOfView / steps;
        const lines = new Array<Phaser.Geom.Line>();
        for (let i=0; i<steps; i++) {
            lines[i] = new Phaser.Geom.Line(location.x, location.y, location.x - distance, location.y);
            Phaser.Geom.Line.RotateAroundPoint(lines[i], lines[i].getPointA(), PhaserHelpers.deg2rad(rotationAngle));
            rotationAngle += offsetAngle;
        }
        const view = new Phaser.Geom.Polygon([
            lines[0].getPointA(),
            ...lines.map(l => l.getPointB())
        ]);
        return view;
    }
}