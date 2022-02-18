export interface HasThruster {
    thrustFowards(): void;
    boostForwards(): void;
    strafeLeft(): void;
    strafeRight(): void;
    thrustBackwards(): void;
}