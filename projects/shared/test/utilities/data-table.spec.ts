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

    it('can update records using the update function', () => {
        const dt = new DataTable<TestObj>({
            indexKeys: ['strKey', 'numKey'],
            records: [
                {strKey: 'foo', boolKey: true, numKey: 1},
                {strKey: 'foo', boolKey: true, numKey: 2},
                {strKey: 'foo', boolKey: false, numKey: 3},
                {strKey: 'foo', boolKey: false, numKey: 4}
            ]
        });
        dt.update({strKey: 'foo', boolKey: false, numKey: 2});

        const actual = dt.selectFirst({strKey: 'foo', numKey: 2});
        expect(actual.boolKey).to.be.false;
    })
})