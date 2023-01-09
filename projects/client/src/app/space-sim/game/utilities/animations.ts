import { GameObjectPlus } from "../../../../../../shared/src/interfaces/game-object-plus";

export module Animations {
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
        return Animations.flicker(obj, duration - (duration / 5), () => {
            Animations.fadeOut(obj, duration / 5, onComplete);
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
            loop: (duration >= 0) ? duration / 100 : duration,
            duration: 100,
            onComplete: onComplete
        });
    }
}