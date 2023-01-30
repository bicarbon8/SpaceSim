import { Logging } from "./logging";

export module TryCatch {
    export type ErrorFormat = 'none' | 'message' | 'stack' | 'all';
    
    export function run(func: () => void, 
        level: Logging.LogLevel = 'warn',
        message: string = '', 
        errorFormat: ErrorFormat = 'message'): void {
        try {
            func();
        } catch (e) {
            if (level !== 'none') {
                if (errorFormat !== 'none') {
                    switch(errorFormat) {
                        case 'stack':
                            const s = (e as Error)?.stack ?? e;
                            message = (message?.length) ? `${message}\n${s}` : s;
                            Logging.log(level, message);
                            break;
                        case 'all':
                            Logging.log(level, message, e);
                            break;
                        case 'message':
                        default:
                            const m = (e as Error)?.message ?? e;
                            message = (message?.length) ? `${message}\n${m}` : m;
                            Logging.log(level, message);
                            break;
                    }
                }
            }
        }
    }
}