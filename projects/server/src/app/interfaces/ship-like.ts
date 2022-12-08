import { Weapons } from "../ships/attachments/offence/weapons";
import { CanTarget } from "./can-target";
import { GameObjectPlus } from "./game-object-plus";
import { HasFuel } from "./has-fuel";
import { HasGameObject } from "./has-game-object";
import { HasIntegrity } from "./has-integrity";
import { HasLocation } from "./has-location";
import { HasTemperature } from "./has-temperature";
import { Updatable } from "./updatable";

export type ShipLike = HasGameObject<GameObjectPlus> & Updatable & HasLocation & CanTarget & HasIntegrity & HasFuel & HasTemperature & {
    getWeapons(): Weapons;
};