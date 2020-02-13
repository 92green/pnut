// @flow
import type Series from '../series/Series';

type Config = {
    key: string
};
export default function normalizeToPercentage(config: Config) {
    const {key} = config;
    return (series: Series) => {
        series.preprocess.normalizeToPercentage = true;
        series.preprocess.stacked = true;
        series.preprocess.stackType = 'points';

        const next = series.mapPoints((point) => {
            const total = point.reduce((rr, point) => rr + (point[key] || 0), 0);
            let sum = 0;
            const nextPoints = point.map(point => {
                let next = Object.assign({}, point);
                next.originalValue = next[key];
                next.percentValue = ((next[key] || 0) / total);
                sum += (next[key] || 0);
                next[key] = sum / total;
                return next;

            });
            return nextPoints;
        });
        return next;
    };
}
