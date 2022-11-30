export interface HasTemperature {
    readonly temperature: number;
    isOverheating(): boolean;
    applyHeating(degrees: number): void;
    applyCooling(degrees: number): void;
}