export interface HasState<T> {
    readonly currentState: T;
    setCurrentState(state: Partial<T>): this;
}