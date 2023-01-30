export type DataTableOptions<T extends {}> = {
    /**
     * an array of fields in `T` whose values will be used to generate
     * a unique record index for each record added to the table
     */
    indexKeys?: Array<keyof T>;
    /**
     * an array of records to add on creation of the table; alternatively
     * you can use the `add(record: T)` function after creation
     */
    records?: Array<T>;
    /**
     * a string to use to separate the index key values when generating
     * a unique key to index the table
     */
    keyDelimiter?: string;
};

export class DataTable<T extends {}> {
    private readonly _tableMap = new Map<string, T>();
    private readonly _indexKeys = new Array<keyof T>();
    private readonly _keyDelim: string;
    
    constructor(options?: DataTableOptions<T>) {
        options = {
            keyDelimiter: '-',
            ...options
        };
        this._keyDelim = options.keyDelimiter;
        if (options.indexKeys) {
            this._indexKeys.splice(this._indexKeys.length, 0, ...options.indexKeys);
        }
        if (options.records) {
            for (let record of options.records) {
                this.add(record);
            }
        }
    }

    /**
     * adds a new unique object to the table if no objects already
     * exist that use the same index key(s)
     * @param record a new object to be added to the table
     * @returns `true` if the object was added or `false` if an object
     * already exists using the same index key(s)
     */
    add(record: T): boolean {
        if (record) {
            const key = this.getKey(record);
            if (!this._tableMap.has(key)) {
                this._tableMap.set(key, record);
                return true;
            }
        }
        return false;
    }

    /**
     * updates an existing object in the table with new values for
     * all fields that have changed, preserving any unchanged fields
     * and the fields used as index keys
     * @param updates an existing object containing updated values
     * @param queries optional objects containing one or more fields in type `T`
     * used to filter the results. returned results must match all values specified.
     * if not supplied then the `updates` object will be used to `get` a matching
     * record from the table
     * @returns the number of records updated
     */
    update(updates: Partial<T>, ...queries: Array<Partial<T>>): number {
        let count = 0;
        if (updates) {
            let oldRecords: Array<T>;
            if (queries?.length) {
                oldRecords = this.select(...queries);
            } else {
                oldRecords = [this.get(updates)];
            }
            if (oldRecords?.length) {
                for (const oldRecord of oldRecords) {
                    this._tableMap.set(this.getKey(oldRecord), {
                        ...oldRecord,
                        ...updates
                    });
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * finds all objects containing matching values for the supplied
     * fields in `partial`
     * @param queries optional objects containing one or more fields in type `T`
     * used to filter the results. returned results must match all values specified
     * @returns an array of objects containing matching values for all
     * fields supplied in `partial` or all objects if `partial` is not supplied
     */
    select(...queries: Array<Partial<T>>): Array<T> {
        const results = new Array<T>();
        if (queries?.length && queries[0]) {
            for (const query of queries) {
                if (query) {
                    const findByKeys = Object.keys(query);
                    const uArr = Array.from(this._tableMap.values());
                    results.splice(results.length, 0, ...uArr.filter(u => {
                        for (let key of findByKeys) {
                            if (query[key] !== u[key]) {
                                return false;
                            }
                        }
                        return true;
                    }));
                }
            }
        } else {
            // return all records in the table
            results.splice(0, 0, ...this._tableMap.values());
        }
        return JSON.parse(JSON.stringify(results));
    }

    /**
     * finds the first object containing matching values for the supplied fields
     * in `partial`
     * @param partial an optional object containing one or more fields in type `T`
     * @returns the first non-null (and non-undefined) object matching values
     * for all fields supplied in `partial`
     */
    selectFirst(partial?: Partial<T>): T {
        const results = this.select(partial);
        return results.find(r => r != null);
    }

    /**
     * gets the object contained in the table whose index keys match
     * those supplied in `containsIndexKeys`
     * @param containsIndexKeys an object containing all fields used
     * as index keys
     * @returns a single object matching the supplied index keys or
     * `undefined` if none exist
     */
    get(containsIndexKeys: Partial<T>): T {
        const key = this.getKey(containsIndexKeys);
        const record = this._tableMap.get(key);
        if (record) {
            return JSON.parse(JSON.stringify(record));
        }
        return undefined;
    }

    /**
     * returns the number of fields matching the specified selection
     * criteria passed in `partial`
     * @param partial an optional object containing one or more fields in type `T`
     * @returns the number of records found that match the passed in `partial` or
     * all if no `partial` is supplied
     */
    count(partial?: Partial<T>): number {
        const records = this.select(partial);
        return records.length;
    }

    /**
     * removes records from the table whose field values match the 
     * values of the supplied `partial` object
     * @param partial the object whose field values are used to lookup
     * existing records for deletion
     * @returns and array of records that were deleted or empty array
     * if no matches found
     */
    delete(...partial: Array<Partial<T>>): Array<T> {
        const found = this.select(...partial);
        for (let f of found) {
            let key = this.getKey(f);
            this._tableMap.delete(key);
        }
        return found;
    }

    /**
     * removes all records stored by this `DataTable`
     * @returns all removed records
     */
    clear(): Array<T> {
        const records = Array.from(this._tableMap.values());
        this._tableMap.clear();
        return records;
    }

    /**
     * converts the passed in object to a key that is used to uniquely
     * identify records in this table
     * @param record the object that contains the index keys to be
     * converted into a `string` key
     * @returns the `string` key
     */
    getKey(record: Partial<T>): string {
        let key: string;
        if (this._indexKeys.length) {
            for (let k of this._indexKeys) {
                if (!key) {
                    key = JSON.stringify(record[k]);
                } else {
                    key += `${this._keyDelim}${JSON.stringify(record[k])}`;
                }
            }
        } else {
            key = JSON.stringify(record);
        }
        return key;
    }

    /**
     * parses the supplied `key` to create a partial object containing the fields
     * and values from the `key`
     * @param key a `string` key created by the `generateKey` function
     * @returns a partial object containing fields and values parsed from
     * the supplied `key`
     */
    parseKey(key: string): Partial<T> {
        let partial: Partial<T> = {};
        const values = key.split(this._keyDelim);
        if (values.length >= this._indexKeys.length) {
            for (var i=0; i<this._indexKeys.length; i++) {
                let field = this._indexKeys[i];
                let val = values[i];
                partial[field] = JSON.parse(val);
            }
        } else {
            throw new Error(`invalid key '${key}'`);
        }
        return partial;
    }
}