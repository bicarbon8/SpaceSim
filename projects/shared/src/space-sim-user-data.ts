import { Sanitiser } from "./utilities/sanitiser";

export type SpaceSimUserData = {
    name?: string;
    fingerprint: string;
};

export module SpaceSimUserData {
    export function sanitise(data: SpaceSimUserData): SpaceSimUserData {
        return {
            fingerprint: Sanitiser.sanitise(data.fingerprint),
            name: Sanitiser.sanitise(data.name)
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