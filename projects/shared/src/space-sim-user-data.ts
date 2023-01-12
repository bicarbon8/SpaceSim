import { Helpers } from "./utilities/helpers";

export type SpaceSimUserData = {
    name?: string;
    fingerprint: string;
};

export module SpaceSimUserData {
    export function format(data: SpaceSimUserData): string {
        return `${Helpers.sanitise(data.fingerprint)}-${Helpers.sanitise(data.name)}`;
    }
}