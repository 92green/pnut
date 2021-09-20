// @flow
import Series from '../series/Series';
import sortBy from 'unmutable/sortBy';
import {bisector} from 'd3-array';

type ScaleConfig = {
    series: Series,
    key: string,
    scale: Function
};

export default class Scale {
    series: Series;
    key: string;
    scale: Function;
    range: [number, number];
    domain: Array<any>;
    constructor(config: ScaleConfig) {
        this.key = config.key;
        this.scale = config.scale;
        this.series = config.series;
        this.range = config.scale.range ? config.scale.range() : [0, 1];
        this.domain = config.scale.domain ? config.scale.domain() : [];
    }
    get = (point: Object) => {
        return point && point[this.key];
    };
    scalePoint = (point: Object) => {
        return this.scale(this.get(point));
    };
    invert = (value: any): Array<any> => {
        return this.series.groups.map<Object>(groups => {
            const inverted = this.scale.invert(value);
            const sorted = sortBy(this.get)(groups);
            const bisect = bisector(this.get);
            const index = bisect.right(sorted, inverted);
            const d0 = sorted[Math.max(0, index - 1)];
            const d1 = sorted[index];
            if (!d0) return d1;
            if (!d1) return d0;
            return inverted - this.get(d0) > this.get(d1) - inverted ? d1 : d0;
        });
    };
}
