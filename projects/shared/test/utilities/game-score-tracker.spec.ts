import { expect } from "chai";
import { describe, it } from "mocha";
import GameScoreTracker from "../../src/utilities/game-score-tracker";

describe('GameScoreTracker', () => {
    it('can start tracking', () => {
        const gst = new GameScoreTracker();
        gst.start({
            id: 'fake-id',
            name: 'fake-name',
            integrity: 100,
            remainingAmmo: 100,
            remainingFuel: 100
        });

        const actualScore = gst.getScore('fake-id');
        expect(actualScore).to.eq(0);
        const actualStats = gst.getStats({shipId: 'fake-id'});
        expect(actualStats.name).to.eq('fake-name');
        expect(actualStats.integrityRemaining).to.eq(100);
        expect(actualStats.ammoRemaining).to.eq(100);
        expect(actualStats.fuelRemaining).to.eq(100);
    })
})