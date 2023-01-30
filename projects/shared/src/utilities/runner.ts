import { Logging } from "./logging";

export module Runner {
    export async function asAsync<T>(func: () => T): Promise<T> {
        try {
            return Promise.resolve()
                .then(func)
                .catch((err) => {
                    Logging.log('warn', err);
                    return Promise.reject(err);
                });
        } catch (e) {
            Logging.log('warn', e);
            return Promise.reject(e);
        }
    }
}