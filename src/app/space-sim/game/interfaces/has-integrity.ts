import { DamageOptions } from "../ships/damage-options";

export interface HasIntegrity {
    getIntegrity(): number;
    sustainDamage(damageOpts: DamageOptions): void;
    repair(amount: number): void;
    destroy(): void;
}