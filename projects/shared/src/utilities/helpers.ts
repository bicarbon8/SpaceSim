export module Helpers {
    /**
     * get the number of elements in an enum.
     * <p>
     * ex: <i>enum Foo { bar = 0, baz = 1, boz = 2 }</i><br />
     * returns: <b>3</b>
     * </p>
     * @param enumType the type name of an enum
     * @returns the number of elements in the enum
     */
    export function enumLength(enumType: any): number {
        let count = 0;
        for(let item in enumType) {
            if(isNaN(Number(item))) {
                count++;
            }
        }
        return count;
    }

    /**
     * takes in a `map` and a `value` and returns an array of 
     * `keys` that contained the `value`
     * @param map a map to search the values of
     * @param value the value to be searched for
     * @returns an array of keys that had the specified value
     */
    export function getMapKeysByValue<K, V>(map: Map<K, V>, value: V): Array<K> {
        const keys = new Array<K>();
        for (let [key, val] of map.entries()) {
            if (val === value) {
                keys.push(key);
            }
        }
        return keys;
    }
}