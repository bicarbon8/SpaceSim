export interface IsConfigurable<T> {
    readonly config: T;
    configure(config: Partial<T>): this;
}