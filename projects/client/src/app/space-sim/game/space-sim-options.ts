import { GameMapOptions } from "./map/game-map-options";
import { ShipOptions } from "./ships/ship-options";
import { StellarBodyOptions } from "./star-systems/stellar-body-options";

export interface SpaceSimOptions {
    debug?: boolean;
    width?: number;
    height?: number;
    parentElementId?: string;
    playerOpts?: ShipOptions;
    stellarBodyOpts?: StellarBodyOptions;
    mapOpts?: GameMapOptions;
}