import {Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint, Constraint, IConstraintRenderDefinition} from "matter-js";

export module SpaceSim {
    var engine = Engine.create();
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            wireframes: true
        }
    });
    var runner = Runner.create();

    export function addBody(body: Matter.Composite | Matter.Body | Matter.Body[] | Matter.Composite[] | Matter.Constraint | Matter.Constraint[]): void {
        World.add(engine.world, body);
    }

    export function start(): void {
        engine.world.gravity.y = 0;
        
        let ship = Bodies.rectangle(100, 100, 50, 50, {
            frictionAir: 0.01
        });
        World.add(engine.world, ship);

        let mouse = Mouse.create(render.canvas);
        let mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: true
                } as IConstraintRenderDefinition
            } as Constraint
        });
        World.add(engine.world, mouseConstraint);

        Engine.run(engine);
        Render.run(render);
        Runner.run(runner, engine);
    }

    export function stop(): void {
        Render.stop(render);
        Runner.stop(runner);
    }
}

SpaceSim.start();