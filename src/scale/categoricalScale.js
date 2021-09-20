// @flow
import type Series from '../series/Series';
import {scaleOrdinal, scaleQuantize, scaleBand} from 'd3-scale';
import Scale from './baseScale';
import flattenArray from '../util/flattenArray';

type CategoricalScaleConfig = {
    key: string,
    series: Series,
    padding?: number,
    range?: [number, number]
};

export default class CategoricalScale extends Scale {
    constructor(config: CategoricalScaleConfig) {
        const {key, series, padding, range = []} = config;
        const data = flattenArray(series.groups);

        // create the domain from unique values
        const domain = new Set();
        data.forEach(item => item[key] != null && domain.add(item[key]));

        // create a band or ordinal scale if padding is provided
        let scale;

        if (padding != null) {
            let d3Scale = scaleBand()
                .domain([...domain])
                .range(range)
                .padding(padding);
            scale = value => d3Scale(value) + d3Scale.bandwidth() / 2;
            scale.range = d3Scale.range;
            scale.domain = d3Scale.domain;
            scale.bandwidth = d3Scale.bandwidth;
            scale.step = d3Scale.step;
        } else {
            scale = scaleOrdinal()
                .domain([...domain])
                .range(range);
        }

        // make sure the inverted base scale is quantized to the original domain items
        scale.invert = scaleQuantize()
            .domain(scale.range())
            .range(scale.domain());

        super({key, series, scale});
    }
}
