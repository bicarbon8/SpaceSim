export interface Updatable {
    active: boolean;
    update(): void;
}