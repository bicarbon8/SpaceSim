import { Helpers } from "./utilities/helpers";

export type SpaceSimUserData = {
    name?: string;
    fingerprint: string;
};

export module SpaceSimUserData {
    export function uniqueKey(data: SpaceSimUserData): string {
        const sanitised = SpaceSimUserData.sanitise(data);
        return `${sanitised.fingerprint}-${sanitised.name}`;
    }
    export function sanitise(data: SpaceSimUserData): SpaceSimUserData {
        return {
            fingerprint: Helpers.sanitise(data.fingerprint),
            name: Helpers.sanitise(data.name)
        } as const;
    }
    export function isValid(data: SpaceSimUserData): boolean {
        if (data) {
            const sanitised = SpaceSimUserData.sanitise(data);
            if (!sanitised) return false;
            if (!sanitised.name || sanitised.name.length < 3) return false;
            if (!sanitised.fingerprint || sanitised.fingerprint.length < 5) return false;
            return true;
        }
        return false;
    }
}