import { Weapon } from "../ships/attachments/offence/weapon";

export type HasWeapons = {
    getWeapons(): Weapon;
}