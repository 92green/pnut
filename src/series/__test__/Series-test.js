import Series from '../Series';

describe('Series', () => {

    it('can contruct a series', () => {
        expect(new Series([[1]])).toBeInstanceOf(Series);
        expect(new Series([[1]]).data).toEqual([[1]]);
    });

    it('has a static of method for constructing', () => {
        expect(Series.of([[1]])).toBeInstanceOf(Series);
        expect(Series.of([[1]])).toEqual(new Series([[1]]));
    });

    it('can get individual items ', () => {
        const series = new Series([
            [1,2,3],
            [4,5,6]
        ]);
        expect(series.get(1, 2)).toBe(6);
        expect(series.get(0, 0)).toBe(1);
    });

    it('can map groups', () => {
        const series = new Series([
            [1,2,3],
            [4,5,6]
        ]);
        expect(series.mapGroups(group => group.map(ii => ii * 2)).data).toEqual([
            [2,4,6],
            [8,10,12]
        ])
    });

    it('can get groups', () => {
        const series = new Series([
            [1,2,3],
            [4,5,6]
        ]);
        expect(series.getGroup(1)).toEqual([4,5,6]);
    });

    it('can map points', () => {
        const predicate = jest.fn(() => ['foo', 'bar']);
        const series = new Series([
            [1,2,3],
            [4,5,6]
        ]);

        const nextSeries = series.mapPoints(predicate);
        expect(predicate).toHaveBeenCalledTimes(3);
        expect(predicate).toHaveBeenNthCalledWith(1, [1,4], 0);
        expect(predicate).toHaveBeenNthCalledWith(2, [2,5], 1);
        expect(predicate).toHaveBeenNthCalledWith(3, [3,6], 2);

        expect(nextSeries.data).toEqual([
            ['foo', 'foo', 'foo'],
            ['bar', 'bar', 'bar']
        ]);

    });

    it('can get points', () => {
        const series = new Series([
            [1,2,3],
            [4,5,6]
        ]);
        expect(series.getPoint(1)).toEqual([2,5]);
    });

});
