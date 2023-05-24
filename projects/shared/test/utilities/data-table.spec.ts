import { expect } from "chai";
import { describe, it } from "mocha";
import { DataTable } from "../../src/utilities/data-table";

type TestObj = {
    strKey?: string;
    boolKey?: boolean;
    numKey?: number;
    objKey?: TestObj;
};

describe('DataTable', () => {
    it('can add records via contructor options', () => {
        const dt = new DataTable<TestObj>({
            records: [
                { strKey: 'foo', boolKey: true },
                { strKey: 'foo', boolKey: false }
            ]
        });

        expect(dt.count(), 'number of records in the table').to.eq(2, 'should be 2');
        const actual = dt.select();
        expect(actual[0].strKey).to.eq('foo');
        expect(actual[0].boolKey).to.eq(true);
        expect(actual[1].strKey).to.eq('foo');
        expect(actual[1].boolKey).to.eq(false);
    })

    it('can add indexKeys via contructor options', () => {
        const dt = new DataTable<TestObj>({
            indexKeys: ['boolKey']
        });

        const actualKey = dt.getKey({ strKey: 'foo', boolKey: true, numKey: 10 });
        expect(actualKey).to.eq('true');
    })

    it('can add key delimiter via contructor options', () => {
        const dt = new DataTable<TestObj>({
            keyDelimiter: ':',
            indexKeys: ['strKey', 'numKey']
        });

        const actualKey = dt.getKey({ strKey: 'foo', boolKey: false, numKey: 111 });
        expect(actualKey).to.eq('"foo":111');
    })

    it('does not update source table if returned record is modified', () => {
        const dt = new DataTable<TestObj>({
            indexKeys: ['strKey'],
            records: [
                { strKey: 'foo', boolKey: true, numKey: 222 }
            ]
        });
        const record = dt.selectFirst();
        record.strKey = 'bar';
        record.boolKey = false;
        record.numKey = 333;

        const actual = dt.selectFirst();
        expect(actual.strKey).to.eq('foo');
        expect(actual.boolKey).to.eq(true);
        expect(actual.numKey).to.eq(222);
    })

    it('can update record using the update function', () => {
        const dt = new DataTable<TestObj>({
            indexKeys: ['strKey', 'numKey'],
            records: [
                {strKey: 'foo', boolKey: true, numKey: 1},
                {strKey: 'foo', boolKey: true, numKey: 2},
                {strKey: 'foo', boolKey: true, numKey: 3},
                {strKey: 'foo', boolKey: true, numKey: 4}
            ]
        });
        const count = dt.update({strKey: 'foo', boolKey: false, numKey: 2});

        expect(count).to.eq(1, 'only one record updated');
        const updated = dt.selectFirst({strKey: 'foo', numKey: 2});
        expect(updated.boolKey).to.be.false;
        const unchanged = dt.select({boolKey: true});
        expect(unchanged.length).to.eq(3);
    })

    it('can update multiple records using the update function', () => {
        const dt = new DataTable<TestObj>({
            indexKeys: ['strKey', 'numKey'],
            records: [
                {strKey: 'foo', boolKey: true, numKey: 1},
                {strKey: 'foo', boolKey: false, numKey: 2},
                {strKey: 'foo', boolKey: false, numKey: 3},
                {strKey: 'foo', boolKey: false, numKey: 4}
            ]
        });
        const count = dt.update({boolKey: true}, {numKey: 2}, {numKey: 3});

        expect(count).to.eq(2, 'only two records updated');
        const unchanged = dt.selectFirst({strKey: 'foo', numKey: 4});
        expect(unchanged.boolKey).to.be.false;
        const updated = dt.select({numKey: 2}, {numKey: 3});
        expect(updated.length).to.eq(2);
        expect(updated.every(c => c.boolKey === true)).to.be.true;
    })

    it('can remove records by query data', () => {
        const dt = new DataTable<TestObj>({
            records: [
                {strKey: 'foo', boolKey: true, numKey: 1},
                {strKey: 'foo', boolKey: false, numKey: 2},
                {strKey: 'foo', boolKey: false, numKey: 1},
                {strKey: 'foo', boolKey: true, numKey: 2},
                {strKey: 'bar', boolKey: true, numKey: 1},
                {strKey: 'bar', boolKey: false, numKey: 2},
                {strKey: 'bar', boolKey: false, numKey: 1},
                {strKey: 'bar', boolKey: true, numKey: 2}
            ]
        });

        const deleted = dt.delete({strKey: 'foo', boolKey: true});
        expect(deleted.length).to.eq(2, 'expected two records removed based on criteria');
        expect(deleted.filter(d => d.numKey === 1).length).to.eq(1);

        const remaining = dt.delete({strKey: 'foo'}, {strKey: 'bar'});
        expect(remaining.length).to.eq(6);
        expect(dt.count()).to.eq(0);
    })

    it('can clear all records', () => {
        const dt = new DataTable<TestObj>({
            records: [
                {strKey: 'foo', boolKey: true, numKey: 1},
                {strKey: 'foo', boolKey: false, numKey: 2},
                {strKey: 'foo', boolKey: false, numKey: 1},
                {strKey: 'foo', boolKey: true, numKey: 2},
                {strKey: 'bar', boolKey: true, numKey: 1},
                {strKey: 'bar', boolKey: false, numKey: 2},
                {strKey: 'bar', boolKey: false, numKey: 1},
                {strKey: 'bar', boolKey: true, numKey: 2}
            ]
        });

        expect(dt.count()).to.eq(8);
        dt.clear();
        expect(dt.count()).to.eq(0);
    })
})