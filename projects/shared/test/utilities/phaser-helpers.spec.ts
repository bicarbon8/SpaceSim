import { expect } from "chai";
import { Helpers } from "../../src/utilities/helpers";

describe('Helpers', () => {
    describe('Vector2', () => {
        it('can create with only one value', () => {
            const v = Helpers.vector2(3);

            expect(v.x).to.eq(3);
            expect(v.y).to.eq(3);
        })

        it('can create from Vector2Like type', () => {
            const v = Helpers.vector2({x: 4, y: 2});

            expect(v.x).to.eq(4);
            expect(v.y).to.eq(2);
        })
    })

    describe('getHeading', () => {
        const headingTestData = [
            {angle: 0, expected: {x: -1, y: 0}},
            {angle: 45, expected: {x: -1, y: -1}},
            {angle: 90, expected: {x: 0, y: -1}},
            {angle: -90, expected: {x: 0, y: 1}}
        ]

        for (const data of headingTestData) {
            it(`can convert angle ${data.angle} into Vector2 heading ${JSON.stringify(data.expected)}`, () => {
                const heading = Helpers.getHeading(data.angle);

                expect(Number(heading.x.toFixed(0))).to.eq(data.expected.x);
                expect(Number(heading.y.toFixed(0))).to.eq(data.expected.y);
            })
        }
    })
})