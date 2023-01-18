import { DamageMetadata } from "./damage-metadata";

export type HasIntegrity = {
    readonly integrity: number;
    sustainDamage(damageOpts: DamageMetadata): void;
    repair(amount: number): void;
    selfDestruct(): void;
    cancelSelfDestruct(): void;
    destroy(): void;
};