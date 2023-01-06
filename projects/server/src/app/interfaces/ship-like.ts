import { CanTarget } from "./can-target";
import { GameObjectPlus } from "./game-object-plus";
import { HasEngine } from "./has-engine";
import { HasFuel } from "./has-fuel";
import { HasGameObject } from "./has-game-object";
import { HasId } from "./has-id";
import { HasIntegrity } from "./has-integrity";
import { HasLocation } from "./has-location";
import { HasTemperature } from "./has-temperature";
import { HasWeapons } from "./has-weapons";
import { Updatable } from "./updatable";

export type ShipLike = HasGameObject<GameObjectPlus> 
    & HasId 
    & Updatable 
    & HasLocation 
    & CanTarget 
    & HasIntegrity 
    & HasFuel 
    & HasTemperature 
    & HasWeapons
    & HasEngine;