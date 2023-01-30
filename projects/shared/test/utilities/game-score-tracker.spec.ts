import { expect } from "chai";
import { describe, it } from "mocha";
import {GameScoreTracker} from "../../src/utilities/game-score-tracker";

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

    it('can export all stats', () => {
        const gst = new GameScoreTracker();
        for (let i=0; i<10; i++) {
            gst.start({
                id: `fake-${i}`,
                name: `fake-name-${i}`,
                integrity: i * 10,
                remainingAmmo: i * 10,
                remainingFuel: i * 10
            })
        }

        const all = gst.getAllStats();
        expect(all.length).to.eq(10);
        for (const stat of all) {
            const [fake, i] = stat.shipId.split('-');
            expect(stat.integrityRemaining).to.eq(+i * 10);
            expect(stat.ammoRemaining).to.eq(+i * 10);
            expect(stat.fuelRemaining).to.eq(+i * 10);
        }
    })

    it('can import stats', () => {
        const gst = new GameScoreTracker();
        expect(gst.getAllStats().length).to.eq(0);
        const stats = new Array<GameScoreTracker.GameStats>();
        for (let i=0; i<10; i++) {
            stats.push({
                shipId: `fake-${i}`,
                name: `fake-name-${i}`,
                integrityRemaining: i * 10,
                ammoRemaining: i * 10,
                fuelRemaining: i * 10,
                accuracy: i,
                lastUpdatedAt: Date.now(),
                startedAt: Date.now(),
                opponentsDestroyed: new Array<GameScoreTracker.Destroyed>(),
                shotsFired: i * 10,
                shotsLanded: new Array<GameScoreTracker.HitsOnTarget>()
            });
        }
        gst.updateAllStats(...stats);
        const all = gst.getAllStats();
        expect(all.length).to.eq(10);
        
        for (let i=0; i<10; i++) {
            let stat = gst.getStats({shipId: `fake-${i}`});

            expect(stat.integrityRemaining).to.eq(+i * 10);
            expect(stat.ammoRemaining).to.eq(+i * 10);
            expect(stat.fuelRemaining).to.eq(+i * 10);
        }

        gst.updateAllStats({shipId: 'fake-0', integrityRemaining: 100});
        const updated = gst.getStats({shipId: 'fake-0'});

        expect(updated.integrityRemaining).to.eq(100);
        expect(updated.ammoRemaining).to.eq(0);
    })

    
})