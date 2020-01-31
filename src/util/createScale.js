// @flow
import type ChartData from '../chartdata/ChartData';
import type {ChartRow} from '../definitions';
import type {Scale} from '../definitions';

import * as d3Scale from 'd3-scale';
import * as array from 'd3-array';

import isContinuous from './isContinuous';
import isDate from './isDate';

export type ScaleConfig<Data> = {
    columns: Array<string>,
    data: Data,
    scaleType?: string,
    updateScale?: Scale => Scale,
    range: [number, number],
    stack?: boolean,
    zero?: boolean,
    stackedData: Array<Array<Array<number>>>
};

type AnyChartData = ChartData<ChartRow>;


function min(data, columns, stackedData) {
    return stackedData
        ? array.min([].concat(...stackedData), d => d[0])
        : data.min(columns)
    ;
}

function max(data, columns, stackedData) {
    return stackedData
        ? array.max([].concat(...stackedData), d => d[1])
        : data.max(columns)
    ;
}

export default function createScale<Data: AnyChartData>(config: ScaleConfig<Data>): Function {
    const {columns} = config;
    const {scaleType} = config;
    const {data} = config;
    const {stack} = config;
    const {range = []} = config;
    const {zero} = config;
    const {stackedData} = config;

    if(stack && !stackedData) throw 'You cant stack a scale without stackedData';

    const continuousList = isContinuous(columns, data);

    // are any of the columns continuous.
    const continuous = continuousList.includes(true) && scaleType !== 'scaleBand';
    const time = isDate(columns, data).includes(true);
    let domainArray;

    const scaleName = scaleType || (
        time
            ? 'scaleTime'
            : continuous
                ? 'scaleLinear'
                : 'scaleBand'
    );

    // if the size is greater than one we have multiple data types
    if(new Set(continuousList).size > 1) {
        throw new Error(`A scale cannot share continuous and non continuous data: ${columns.join(', ')}`);
    }

    if (continuous) {
        if(stack) {
            if(time) throw 'Stacked columns must be numerical';
            domainArray = [
                zero ? 0 : min(data, columns, stackedData),
                max(data, columns, stackedData)
            ];
        }
        // binned and normal
        else {
            domainArray = [
                zero ? 0 : min(data, columns),
                max(data, columns)
            ];
        }
    } else {
        // the domain of non-continuous data has to be an array of all unique values of columns
        domainArray = data.getUniqueValues(columns);
    }


    return d3Scale[scaleName]()
        .domain(domainArray)
        .range(range);
}