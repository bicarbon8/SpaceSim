import { Weapons } from "../ships/attachments/offence/weapons";

export interface CanShoot {
    trigger(): void;
}