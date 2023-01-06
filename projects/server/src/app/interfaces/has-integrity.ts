import { DamageOptions } from "../ships/damage-options";

export type HasIntegrity = {
    readonly integrity: number;
    sustainDamage(damageOpts: DamageOptions): void;
    repair(amount: number): void;
    selfDestruct(): void;
    cancelSelfDestruct(): void;
    destroy(): void;
};