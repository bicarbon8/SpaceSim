export interface HasTemperature {
    applyHeating(degrees: number): void;
    applyCooling(degrees: number): void;
}