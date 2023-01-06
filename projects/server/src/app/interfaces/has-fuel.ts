export type HasFuel = {
    reduceFuel(amount: number): void;
    addFuel(amount: number): void;
    getRemainingFuel(): number;
};