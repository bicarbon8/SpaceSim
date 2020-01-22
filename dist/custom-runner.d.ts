import { Engine, Runner } from "matter-js";
export declare class CustomRunner extends Runner {
    private eng;
    constructor(engine: Engine);
    run(): void;
}
