import {Engine, Render, Runner, World, Bodies, Mouse} from "matter-js";
import { ShipPod } from "./ships/ship-pod";

export module Game {
    export var active: boolean = false;

    var lastUpdateTime: number;
    var engine: Engine;
    var render: Render;

    export var mouse: Mouse;
    export var keys: string[] = [];
    export var player: ShipPod;

    export function start(): void {
        active = true;

        player = new ShipPod();

        engine = Engine.create();
        engine.world.gravity.y = 0;
        render = Render.create({
            element: document.body,
            engine: engine,
            options: {
                wireframes: true
            }
        });
        World.add(engine.world, player.obj);
        Render.run(render);
        mouse = Mouse.create(render.canvas);

        document.addEventListener('keydown', (event: KeyboardEvent) => {
            event.stopPropagation();
            keys.push(event.code);
        });

        gameLoop();
    }

    export function stop(): void {
        active = false;
        Render.stop(render);
    }

    function gameLoop(): void {
        if (active) {
            let now: number = new Date().getTime();
            let delta: number = now - lastUpdateTime;
            lastUpdateTime = now;

            player.update();

            Engine.update(engine, delta);

            window.requestAnimationFrame(gameLoop);
        }
    }
}