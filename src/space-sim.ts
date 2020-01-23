import {Engine, Render, Runner, World, Bodies, Mouse} from "matter-js";
import { ShipPod } from "./ships/ship-pod";
import { InputListener } from "./controls/input-listener";

export module SpaceSim {
    var engine: Engine = Engine.create();
    var render: Render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            wireframes: true
        }
    });
    var runner: Runner = Runner.create();
    var listener: InputListener = new InputListener();

    export var mouse: Mouse = Mouse.create(render.canvas);
    
    var _ships: ShipPod[] = [];
    export function ships(): ShipPod[] {
        return _ships;
    }

    var _systems: any[] = [];
    export function systems(): any[] {
        return _systems;
    }

    export var player: ShipPod = new ShipPod();

    export function addShips<T extends ShipPod>(...ships: T[]): void {
        for (var i=0; i<ships.length; i++) {
            let ship: ShipPod = ships[i];
            if (ship) {
                _ships.push(ship);
                // World.add(engine.world, ship.obj);
            }
        }
    }

    export function start(): void {
        engine.world.gravity.y = 0;
        
        World.add(engine.world, player.obj);

        Render.run(render);
        Runner.run(runner, engine);
        listener.run(player);
    }

    export function stop(): void {
        listener.stop();
        Render.stop(render);
        Runner.stop(runner);
    }
}