import { Weapons } from "../ships/attachments/offence/weapons";

export type HasWeapons = {
    getWeapons(): Weapons;
}