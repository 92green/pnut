import GroupedSeries from '../GroupedSeries';

it('will create zero points for bad data', () => {
    const data = [
        {type: 'foo', x: 0, value: 1},
        {type: 'foo', x: 1, value: 1},
        {type: 'foo', x: 2, value: 1},
        {type: 'bar', x: 0, value: 2}
    ];

    const series = new GroupedSeries({
        data,
        pointKey: 'x',
        groupKey: 'type',
        defaultPoint: {value: 0}
    });

    expect(series.groups[1]).toEqual([
        {type: 'bar', x: 0, value: 2},
        {type: 'bar', x: 1, value: 0},
        {type: 'bar', x: 2, value: 0}
    ]);
});

it('will create zero points for bad data halfway through', () => {
    const data = [
        {type: 'foo', x: 0, value: 1},
        {type: 'foo', x: 1, value: 1},
        {type: 'foo', x: 2, value: 1},
        {type: 'bar', x: 1, value: 2} // Missing the first x item
    ];

    const series = new GroupedSeries({
        data,
        pointKey: 'x',
        groupKey: 'type',
        defaultPoint: {value: 0}
    });

    expect(series.groups[1]).toEqual([
        {type: 'bar', x: 0, value: 0},
        {type: 'bar', x: 1, value: 2},
        {type: 'bar', x: 2, value: 0}
    ]);
});

it('will sort the points', () => {
    const data = [
        {type: 'foo', x: 1, value: 1},
        {type: 'foo', x: 0, value: 1},
        {type: 'foo', x: 2, value: 1}
    ];

    const series = new GroupedSeries({
        data,
        pointKey: 'x',
        groupKey: 'type',
        defaultPoint: {value: 0}
    });

    expect(series.groups[0]).toEqual([
        {type: 'foo', x: 0, value: 1},
        {type: 'foo', x: 1, value: 1},
        {type: 'foo', x: 2, value: 1}
    ]);
});
