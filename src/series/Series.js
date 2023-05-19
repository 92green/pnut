// @flow
import getIn from 'unmutable/getIn';

export type Point = {[string]: any};

export type SeriesConfig = {
    groups: Array<Array<Point>>,
    rawData: Array<Point>,
    groupKey: Array<string>,
    pointKey?: ?string,
    preprocess?: Object
};

export default class Series {
    groups: Point[][];
    rawData: Point[];
    groupKey: string[];
    pointKey: ?string;
    preprocess: Object;

    constructor(config: SeriesConfig) {
        this.rawData = config.rawData;
        this.groups = config.groups;
        this.groupKey = config.groupKey;
        this.pointKey = config.pointKey;
        this.preprocess = config.preprocess || {};
    }

    copy(): Series {
        return new Series({...this});
    }

    update(fn: Function): Series {
        return new Series(fn(this));
    }

    get(groupIndex: number, pointIndex: number): Point {
        return getIn([groupIndex, pointIndex])(this.groups);
    }

    mapGroups(fn: Function): Series {
        this.groups = this.groups.map(fn);
        return this.copy();
    }

    getGroup(index: number): Point[] {
        return this.groups[index];
    }

    mapPoints(fn: Function): Series {
        for (let c = 0; c < this.groups[0].length; c++) {
            let point = fn(this.getPoint(c), c);
            for (let r = 0; r < this.groups.length; r++) {
                this.groups[r][c] = point[r];
            }
        }

        return this.copy();
    }

    getPoint(index: number): Point[] {
        return this.groups.map(group => group[index]);
    }

    sumRow(key: string, index: number) {
        return this.getGroup(index).reduce((acc, row) => acc + (row[key] || 0), 0);
    }

    sumColumn(key: string, index: number) {
        return this.groups.reduce((acc, group) => acc + (group[index][key] || 0), 0);
    }

    sum(key: string): number {
        return this.rawData.reduce((acc, point) => acc + (point[key] || 0), 0);
    }
}
