export interface Updatable {
    active: boolean;
    update(time: number, delta: number): void;
}