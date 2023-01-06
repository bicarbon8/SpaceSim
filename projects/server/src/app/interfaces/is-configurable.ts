export interface IsConfigurable<T> {
    readonly config: T;
    configure(config: T): this;
}