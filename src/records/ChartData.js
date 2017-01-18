// @flow

import {
    minBy,
    maxBy,
    sumBy,
    averageBy,
    medianBy
} from 'immutable-math';

import {
    fromJS,
    List,
    Record
} from 'immutable';

type Datum = string | number | boolean | null;

/**
 * @class
 *
 * ChartData is an Immutable Record used by pnut charts to represent chart data.
 */

class ChartData extends Record({
    columns: List(),
    rows: List()
}) {

    /**
     * Create a ChartData object
     *
     * @param {Array<Object>} rows An array of data rows
     * @param {Array<Object>} columns An array of columns
     *
     * @memberOf ChartData
     */

    constructor(rows: Array<Object>, columns: Array<Object>) {
        super({
            rows: fromJS(rows),
            columns: fromJS(columns)
        });
        this._memos = {};
    }

    _memoize(key: string, fn: Function): Datum {
        if(this._memos.hasOwnProperty(key)) {
            return this._memos[key];
        }
        const value: Datum = fn();
        this._memos[key] = value;
        return value;
    }

    /**
     * Get the minimum non-null value in a column.
     *
     * @param {string} columns The name of the column
     * @return {string|number|boolean|null} The minimum value, or null if no mininum value could be determined
     *
     * @memberOf ChartData
     */

    min(column: string): Datum {
        return this._memoize('min', (): Datum => {
            return this.rows
                .filter(ii => ii != null)
                .update(minBy(ii => ii.get(column)));
        });
    }

    /**
     * Get the maximum value in a column.
     *
     * @param {string} columns The name of the column
     * @return {string|number|boolean|null} The maximum value, or null if no maximum value could be determined
     *
     * @memberOf ChartData
     */

    max(column: string): Datum {
        return this._memoize('max', (): Datum => {
            return this.rows
                .filter(ii => ii != null)
                .update(maxBy(ii => ii.get(column)));
        });
    }

    /**
     * Get the sum of the values in a column.
     *
     * @param {string} columns The name of the column
     * @return {string|number|boolean|null} The sum of the values, or null if no sum could be determined
     *
     * @memberOf ChartData
     */

    sum(column: string): Datum {
        return this._memoize('sum', (): Datum => {
            return this.rows
                .filter(ii => ii != null)
                .update(sumBy(ii => ii.get(column)));
        });
    }

    /**
     * Get the average of the values in a column.
     *
     * @param {string} columns The name of the column
     * @return {string|number|boolean|null} The average of the values, or null if no average could be determined
     *
     * @memberOf ChartData
     */

    average(column: string): Datum {
        return this._memoize('average', (): Datum => {
            return this.rows
                .filter(ii => ii != null)
                .update(averageBy(ii => ii.get(column)));
        });
    }

    /**
     * Get the median of the values in a column.
     *
     * @param {string} columns The name of the column
     * @return {string|number|boolean|null} The median of the values, or null if no median could be determined
     *
     * @memberOf ChartData
     */

    median(column: string): Datum {
        return this._memoize('median', (): Datum => {
            return this.rows
                .filter(ii => ii != null)
                .update(medianBy(ii => ii.get(column)));
        });
    }
}

export default ChartData;
