export type NumberRange = {
    min: number;
    max: number;
};

export type NumberOrRange = number | NumberRange;

export module NumberOrRange {
    export function min(input: NumberOrRange): number {
        if (typeof input === "object") {
            return input.min ?? 0;
        } else {
            return input ?? 0;
        }
    }
    export function max(input: NumberOrRange): number {
        if (typeof input === "object") {
            return input.max ?? 0;
        } else {
            return input ?? 0;
        }
    }
    export function getRealNumber(input: NumberOrRange): number {
        return (typeof input === 'object') 
            ? Phaser.Math.RND.realInRange(input.min, input.max)
            : input;
    }
}