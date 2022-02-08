import { ShipPodOptions } from "./ships/ship-pod-options";
import { SystemBodyOptions } from "./star-systems/system-body-options";

export interface SpaceSimOptions {
    debug?: boolean;
    playerOpts?: ShipPodOptions;
    systemOpts?: SystemBodyOptions;
}