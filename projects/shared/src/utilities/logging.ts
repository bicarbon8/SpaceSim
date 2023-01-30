export module Logging {
    export type LogLevel = 'none' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
    
    /**
     * the minimum level of logs that should be output @default 'warn'
     */
    export var loglevel: LogLevel = 'warn';

    /**
     * logs a message to console if it is equal to or greater than the current
     * `Logging.loglevel` setting using the following format:
     * ```
     * YYYY-MM-DDTHH:mm:SS.sssZ - [LEVEL]: data
     * ```
     * @param level the level this message is at (used to determine if it should
     * be output to the console based on the value of `Logging.loglevel`)
     * @param data the message to be output
     */
    export function log(level: LogLevel, ...data: Array<any>): void {
        if (shouldLog(level)) {
            let func: (...data: Array<any>) => void;
            switch (level) {
                case 'error':
                    func = console.error;
                    break;
                case 'warn':
                    func = console.warn;
                    break;
                case 'info':
                    func = console.info;
                    break;
                case 'debug':
                    func = console.debug;
                    break;
                case 'trace':
                    func = console.trace;
                    break;
                case 'none':
                default:
                    return;
            }
            func(`${dts()} - [${level.toUpperCase()}]:`, ...data);
        }
    }

    /**
     * D.T.S (Date Time String) formats the passed in date (or Date.now()) as a string
     * @param time the time in milliseconds since the epoch @default `Date.now()`
     * @returns a formatted string in the form of `YYYY-MM-DDTHH:mm:SS.sssZ`
     */
    export function dts(time?: number): string {
        const date = new Date(time ?? Date.now());
        return date.toISOString();
    }

    /**
     * determines if the passed in `LogLevel` should be output based on the current
     * value of `Logging.loglevel`
     * @param level the message log level to test against the `Logging.loglevel` value
     * @returns `true` if the message should be output, otherwise `false`
     */
    export function shouldLog(level: LogLevel): boolean {
        switch (loglevel) {
            case 'error':
                if (['error'].includes(level)) {
                    return true;
                }
                break;
            case 'warn':
                if (['error', 'warn'].includes(level)) {
                    return true;
                }
                break;
            case 'info':
                if (['error', 'warn', 'info'].includes(level)) {
                    return true;
                }
                break;
            case 'debug':
                if (['error', 'warn', 'info', 'debug'].includes(level)) {
                    return true;
                }
                break;
            case 'trace':
                if (['error', 'warn', 'info', 'debug', 'trace'].includes(level)) {
                    return true;
                }
                break;
            case 'none':
            default:
                return false;
        }
    }
}