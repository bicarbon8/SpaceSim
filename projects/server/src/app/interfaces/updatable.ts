export type Updatable = {
    active: boolean;
    update(time: number, delta: number): void;
};