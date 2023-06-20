// @flow
import type {Point} from './Series';
import Series from './Series';

type GroupedSeriesConfig = {
    groupKey: string | Array<string>,
    pointKey: string,
    pointSort: Function,
    data: Array<Point>,
    defaultPoint: Point,
    limit?: number
};

export default class GroupedSeries extends Series {
    constructor(config: GroupedSeriesConfig) {
        const {
            pointKey,
            pointSort = (a, b) => {
                if (a[pointKey] > b[pointKey]) return 1;
                if (a[pointKey] < b[pointKey]) return -1;
                return 0;
            },
            data,
            defaultPoint = {}
        } = config;
        const groupKey = [].concat(config.groupKey);
        const baseGroup = new Map();

        if (groupKey.includes(pointKey)) throw 'pointKey cannot be used as a groupKey.';

        data.forEach(item => {
            const pointValue = item[pointKey];
            baseGroup.set(String(pointValue), {[pointKey]: pointValue});
        });

        // Group the data agains groupKey array
        const groupedItems = data.reduce((rr, item) => {
            const key = groupKey.reduce((acc, key) => acc + item[key], '');
            rr[key] = rr[key] || [];
            rr[key].push(item);
            return rr;
        }, {});

        const groups = Object.entries(groupedItems).map(([key, group]) => {
            // Find the first instance of each group key
            const baseValues = Object.fromEntries(
                groupKey.map(key => [key, group.find(ii => ii[key])?.[key]])
            );

            // Create the row as a map with default values
            const groupMap = new Map(
                Array.from(baseGroup, ([key, value]) => [
                    key,
                    {...defaultPoint, ...baseValues, ...value}
                ])
            );

            const newGroupMap = group.reduce((map, item) => {
                return map.set(String(item[pointKey]), {...defaultPoint, ...item});
            }, groupMap);

            return [...newGroupMap.values()].sort(pointSort);
        });

        super({
            pointKey,
            groupKey,
            rawData: data,
            groups
        });
    }
}
