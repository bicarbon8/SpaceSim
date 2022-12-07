import { DamageOptions } from "../ships/damage-options";

export interface HasIntegrity {
    readonly integrity: number;
    sustainDamage(damageOpts: DamageOptions): void;
    repair(amount: number): void;
    destroy(): void;
}