import { expect } from "chai";
import { describe, it } from "mocha";
import { GameScoreTracker } from "../../src/utilities/game-score-tracker";

describe('GameScoreTracker', () => {
    it('can start tracking', () => {
        const gst = new GameScoreTracker();
        gst.start({
            id: 'fake-id',
            name: 'fake-name'
        });

        const actualScore = gst.getScore('fake-id');
        expect(actualScore).to.eq(0);
        const actualStats = gst.getStats({ shipId: 'fake-id' });
        expect(actualStats.name).to.eq('fake-name');
        expect(actualStats.accuracy).to.eq(0);
        expect(actualStats.shotsFired.length).to.eq(0);
        expect(actualStats.shotsLanded.length).to.eq(0);
    })

    it('can export all stats', () => {
        const gst = new GameScoreTracker();
        for (let i = 0; i < 10; i++) {
            gst.start({
                id: `fake-${i}`,
                name: `fake-name-${i}`
            });
            for (let j=0; j<i; j++) {
                gst.shotFired(`fake-${i}`);
                if (j%2 === 0) {
                    gst.shotLanded(`fake-${i}`, `fake-${i}-${j}`, 1);
                }
            }
        }

        const all = gst.getAllStats();
        expect(all.length).to.eq(10);
        for (const stat of all) {
            const [fake, i] = stat.shipId.split('-');
            expect(stat.shotsFired.length).to.eq(+i);
            if (+i > 2) {
                expect(stat.shotsLanded.length).to.be.greaterThan(0);
            }
        }
    })

    it('can import stats', () => {
        const gst = new GameScoreTracker();
        expect(gst.getAllStats().length).to.eq(0);
        const stats = new Array<GameScoreTracker.GameStats>();
        for (let i = 0; i < 10; i++) {
            stats.push({
                shipId: `fake-${i}`,
                name: `fake-name-${i}`,
                accuracy: i,
                lastUpdatedAt: Date.now(),
                startedAt: Date.now(),
                opponentsDestroyed: new Array<GameScoreTracker.Destroyed>({
                    targetId: 'fake-target-id', 
                    time: Date.now()
                }),
                shotsFired: new Array<number>(...[Date.now(), Date.now()]),
                shotsLanded: new Array<GameScoreTracker.Hit>({
                    targetId: 'fake-target-id',
                    damage: 1,
                    time: Date.now()
                })
            });
        }
        gst.updateAllStats(...stats);
        const all = gst.getAllStats();
        expect(all.length).to.eq(10);

        for (let i = 0; i < 10; i++) {
            let stat = gst.getStats({ shipId: `fake-${i}` });

            expect(stat.shotsFired.length).to.eq(2);
            expect(stat.shotsLanded.length).to.eq(1);
            expect(stat.accuracy).to.eq(50);
        }

        const stat = gst.getStats({shipId: 'fake-0'})
        stat.shotsLanded.push({targetId: 'fake-target-id', damage: 1, time: Date.now()});
        gst.updateAllStats({ shipId: 'fake-0', shotsLanded: stat.shotsLanded });
        const updated = gst.getStats({ shipId: 'fake-0' });

        expect(updated.shotsLanded.length).to.eq(2);
        expect(updated.accuracy).to.eq(100);
    })

    it('calculates accuracy when getting stats', () => {
        const gst = new GameScoreTracker();
        gst.start({
            id: 'fake-id',
            name: 'fake-name'
        });

        const actualBefore = gst.getStats({ shipId: 'fake-id' });
        expect(actualBefore.accuracy).to.eq(0);

        // fire and land one shot
        gst.shotFired('fake-id');
        gst.shotLanded('fake-id', 'fake-id-2', 40);
        const actual100 = gst.getStats({ shipId: 'fake-id' });
        expect(actual100.accuracy).to.eq(100, 'expect 100% accuracy');

        // fire and miss
        gst.shotFired('fake-id');
        const actual50 = gst.getStats({ shipId: 'fake-id' });
        expect(actual50.accuracy).to.eq(50, 'expect 50% accuracy');
    })

    it('calculates the correct score', () => {
        const gst = new GameScoreTracker();
        gst.start({
            id: 'fake-id',
            name: 'fake-name'
        });
        expect(gst.getScore('fake-id'), 'starting score').to.eq(0);

        gst.shotFired('fake-id');
        gst.shotFired('fake-id');
        gst.shotFired('fake-id');
        gst.shotLanded('fake-id', 'fake-id-2', 1);
        gst.shotFired('fake-id');
        gst.shotLanded('fake-id', 'fake-id-2', 1); // 50% accuracy (500 points)
        gst.opponentDestroyed('fake-id', 'fake-id-2'); // 1 opponent destroyed (100 points)

        expect(gst.getScore('fake-id'), 'final score').to.eq(600);
    })

    it('generates a correct leaderboard from high to low', () => {
        const gst = new GameScoreTracker();
        gst.updateAllStats({
            shipId: `high-score-id`,
            name: `high-score-name`,
            accuracy: 0,
            lastUpdatedAt: Date.now(),
            startedAt: Date.now(),
            opponentsDestroyed: new Array<GameScoreTracker.Destroyed>({
                targetId: 'fake-target-id', 
                time: Date.now()
            }, {
                targetId: 'fake-target-id-2',
                time: Date.now()
            }, {
                targetId: 'fake-target-id-3',
                time: Date.now()
            }),
            shotsFired: new Array<number>(...[Date.now(), Date.now(), Date.now()]),
            shotsLanded: new Array<GameScoreTracker.Hit>({
                targetId: 'fake-target-id',
                damage: 1,
                time: Date.now()
            }, {
                targetId: 'fake-target-id-2',
                damage: 1,
                time: Date.now()
            }, {
                targetId: 'fake-target-id-3',
                damage: 1,
                time: Date.now()
            })
        }, {
            shipId: `low-score-id`,
            name: `low-score-name`,
            accuracy: 0,
            lastUpdatedAt: Date.now(),
            startedAt: Date.now(),
            opponentsDestroyed: new Array<GameScoreTracker.Destroyed>(),
            shotsFired: new Array<number>(...[Date.now(), Date.now(), Date.now()]),
            shotsLanded: new Array<GameScoreTracker.Hit>()
        }, {
            shipId: `medium-score-id`,
            name: `medium-score-name`,
            accuracy: 0,
            lastUpdatedAt: Date.now(),
            startedAt: Date.now(),
            opponentsDestroyed: new Array<GameScoreTracker.Destroyed>({
                targetId: 'fake-target-id', 
                time: Date.now()
            }),
            shotsFired: new Array<number>(...[Date.now(), Date.now(), Date.now()]),
            shotsLanded: new Array<GameScoreTracker.Hit>({
                targetId: 'fake-target-id',
                damage: 1,
                time: Date.now()
            })
        });
        const leaderboard = gst.getLeaderboard();

        expect(leaderboard.length).to.eq(3);
        expect(leaderboard[0].name).to.eq('high-score-name');
        expect(leaderboard[1].name).to.eq('medium-score-name');
        expect(leaderboard[2].name).to.eq('low-score-name');
    })
})