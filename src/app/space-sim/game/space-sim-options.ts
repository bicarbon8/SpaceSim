import { GameMapOptions } from "./map/game-map-options";
import { ShipPodOptions } from "./ships/ship-pod-options";
import { StellarBodyOptions } from "./star-systems/stellar-body-options";

export interface SpaceSimOptions {
    debug?: boolean;
    width?: number;
    height?: number;
    parentElementId?: string;
    playerOpts?: ShipPodOptions;
    stellarBodyOpts?: StellarBodyOptions;
    mapOpts?: GameMapOptions;
}