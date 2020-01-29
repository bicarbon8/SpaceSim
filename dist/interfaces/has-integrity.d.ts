export interface HasIntegrity {
    getIntegrity(): number;
    sustainDamage(amount: number): void;
    repair(amount: number): void;
}
