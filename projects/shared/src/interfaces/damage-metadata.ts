export type DamageMetadata = {
    timestamp: number;
    attackerId?: string;
    message?: string;
};

export module DamageMetadata {
    export type HasDamageSources = {damageSources: Array<DamageMetadata>};
    
    /**
     * queries the damage sources array for the passed in ship to get the id of
     * the last ship to attack the passed in one.
     * @param ship the ship to query
     * @returns the id of the last ship to attack the passed in ship or `undefined`
     * if none
     */
    export function getLastAttackerId(ship: HasDamageSources): string {
        const attackerId = Array.from(new Set<string>(ship.damageSources
            .filter(d => d.attackerId != null)
            .map(d => d.attackerId)).values())
            .pop();
        return attackerId;
    }
}