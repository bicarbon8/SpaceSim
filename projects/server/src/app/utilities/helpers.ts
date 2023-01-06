import { GameObjectPlus } from "../interfaces/game-object-plus";
import { NumberOrRange } from "../interfaces/number-range";
import { Ship } from "../ships/ship";
import { SpaceSimPlayerData } from "../space-sim-player-data";

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

    export function getRealNumber(input: NumberOrRange): number {
        return (typeof input === 'object') 
            ? Phaser.Math.RND.realInRange(input.min, input.max)
            : input;
    }

    export async function runAsync<T>(func: () => T): Promise<T> {
        try {
            return func();
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        }
    }

    /**
     * fades the passed in `obj` to 0 alpha over the specified `duration` and then calls
     * the `onComplete` function
     * @param obj the object to be tweened
     * @param duration the total amount of time to run the animation
     * @param onComplete a function to run on completion of the tween
     */
    export function fadeOut(obj: GameObjectPlus | Array<GameObjectPlus>, duration: number, onComplete: () => void): Phaser.Tweens.Tween {
        let scene: Phaser.Scene;
        if (Array.isArray(obj)) {
            scene = obj[0].scene;
        } else {
            scene = obj.scene;
        }
        return scene.add.tween({
            targets: obj,
            alpha: 0,
            duration: duration,
            onComplete: onComplete
        });
    }

    /**
     * fades between 100% and 50% opacity 4 times before fading to 0% opacity
     * and calling the passed in `onComplete` function
     * @param obj the objects to be tweened
     * @param duration the total amount of time for the animation to run
     * @param onComplete a function to be run on completion
     */
    export function flickerOut(obj: GameObjectPlus | Array<GameObjectPlus>, duration: number, onComplete: () => void): Phaser.Tweens.Tween {
        return Helpers.flicker(obj, duration - (duration / 5), () => {
            Helpers.fadeOut(obj, duration / 5, onComplete);
        });
    }

    /**
     * fades between 100% and 50% and back to 100% opacity 4 times before
     * calling the passed in `onComplete` function
     * @param obj the objects to be tweened
     * @param duration the total amount of time for the animation to run
     * @param onComplete a function to be run on completion
     */
    export function flicker(obj: GameObjectPlus | Array<GameObjectPlus>, duration: number, onComplete: () => void): Phaser.Tweens.Tween {
        let scene: Phaser.Scene;
        if (Array.isArray(obj)) {
            scene = obj[0].scene;
        } else {
            scene = obj.scene;
        }
        return scene.add.tween({
            targets: obj,
            alpha: 0.5,
            yoyo: true,
            loop: 4,
            duration: duration / 4,
            onComplete: onComplete
        });
    }

    export function trycatch(func: () => void, 
        level: 'debug' | 'info' | 'warn' | 'error' | 'none' = 'debug',
        message: string = '', 
        includeError: boolean = true): void {
        try {
            func();
        } catch (e) {
            let out: (...data: Array<any>) => void;
            if (level !== 'none') {
                switch(level) {
                    case 'debug':
                        out = console.debug;
                        break;
                    case 'info':
                        out = console.info;
                        break;
                    case 'warn':
                        out = console.warn;
                        break;
                    case 'error':
                    default:
                        out = console.error;
                        break;
                }
                if (includeError) {
                    out(message, e);
                } else {
                    out(message);
                }
            }
        }
    }

    /**
     * sanitises the input text ensuring only alphanumeric
     * values are present and length is 10 characters or less
     * @param text input text to be sanitised
     * @returns a string that has special characters removed
     * and is shortened to maximum of 10 characters
     */
    export function sanitise(text: string): string {
        // TODO: filter out bad words
        return text?.replace(/[^a-zA-Z0-9ÀÁÂÃÄÅĀƁƂÇĈĊĎĐÈÉÊËƑĜĞĠĤĦÌÍÎÏĴĶĹĿŁÑŃÒÓÔÕÖƤɊŔŖŚŜŢŤŦÙÚÛÜŴŶŽ]/g, '')
            .substring(0, 10) ?? '';
    }

    /**
     * queries the damage sources array for the passed in ship to get the id of
     * the last ship to attack the passed in one.
     * @param ship the ship to query
     * @returns the id of the last ship to attack the passed in ship or `undefined`
     * if none
     */
    export function getLastAttackerId(ship: Ship): string {
        const attackerId = Array.from(new Set<string>(ship.damageSources
            .filter(d => d.attackerId != null)
            .map(d => d.attackerId)).values())
            .pop();
        return attackerId;
    }
}