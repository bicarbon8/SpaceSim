import { CoreModules } from "./ship-modules/core-modules";

export class Ship {
    private id: string; // UUID
    private manufacturer: string;
    private coreModules: CoreModules;
    private defenceModules: DefenceModules;
}