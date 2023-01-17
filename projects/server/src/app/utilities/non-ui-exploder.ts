import { Exploder, ExploderOptions } from "space-sim-shared";

export class NonUiExploder extends Exploder {
    explode(options: ExploderOptions): this {
        /* do nothing */
        return this;
    }
}