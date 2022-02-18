export interface HasTemperature {
    getTemperature(): number;
    applyHeating(degrees: number): void;
    applyCooling(degrees: number): void;
}